#!/usr/bin/env python3
"""Small, explicit Tripo apiv3 asset workflow. Standard-library Python only.

Only `submit` creates a remote task. There are no automatic submissions,
generation retries, uploads, polling loops, or browser-side credentials.
"""

import argparse
import datetime as dt
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import shutil
import stat
import struct
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
import uuid


ROOT = Path(__file__).resolve().parents[2]
BRIEFS = ROOT / "art/tripo/asset-briefs.json"
LOCAL = ROOT / ".local/tripo"
API_HOSTS = {"global": "https://openapi.tripo3d.ai", "cn": "https://openapi.tripo3d.com"}
ROUTES = {
    "generate": "/v3/generation/text-to-model",
    "rig-check": "/v3/animations/rig-check",
    "rig": "/v3/animations/rig",
    "animate": "/v3/animations/retarget",
    "retarget": "/v3/animations/retarget",
}
IMAGE_ROUTE = "/v3/generation/image-to-model"
SOURCES = [
    "https://www.tripo3d.ai/help/api-plugins/how-to-use-tripo-api",
    "https://developers.tripo3d.ai/zh/docs/quick-start",
    "https://github.com/VAST-AI-Research/tripo-python-sdk/blob/master/docs/API.md",
]
MAX_MODEL_BYTES = 150 * 1024 * 1024


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", value):
        raise ValueError("Task / asset identifier has an invalid format.")
    return value


def reference(value):
    """Keep provenance without retaining credentials or signed URL queries."""
    value = re.sub(r"tsk_[A-Za-z0-9_.-]+", "[redacted]", str(value))
    if value.startswith(("https://", "http://")):
        parsed = urlsplit(value)
        return urlunsplit((parsed.scheme, parsed.hostname or "", parsed.path, "", ""))
    return value[:2000]


def clean_data(value):
    if isinstance(value, dict):
        return {key: clean_data(item) for key, item in value.items()
                if key.lower() not in {"api_key", "tripo_api_key", "authorization"}}
    if isinstance(value, list):
        return [clean_data(item) for item in value]
    if isinstance(value, str):
        return re.sub(r"tsk_[A-Za-z0-9_.-]+", "[redacted]", value)
    return value


def project_path(value):
    path = Path(value).expanduser()
    path = (ROOT / path).resolve() if not path.is_absolute() else path.resolve()
    try:
        path.relative_to(ROOT)
    except ValueError:
        raise ValueError("Output must be inside this project; source files are never changed.") from None
    return path


def atomic_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(clean_data(data), handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def config():
    values = {}
    env_file = ROOT / ".local/tripo.env"
    if env_file.is_file():
        if stat.S_IMODE(env_file.stat().st_mode) & 0o077:
            raise ValueError(".local/tripo.env must be private (chmod 600) before API use.")
        # Parse data only. Never source, eval, interpolate, or print this file.
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[7:].lstrip()
            name, separator, value = line.partition("=")
            if separator and name.strip() in {"TRIPO_API_KEY", "TRIPO_API_REGION"}:
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                values[name.strip()] = value
    key = os.environ.get("TRIPO_API_KEY", values.get("TRIPO_API_KEY", "")).strip()
    region = os.environ.get("TRIPO_API_REGION", values.get("TRIPO_API_REGION", "global")).strip()
    if not re.fullmatch(r"tsk_[A-Za-z0-9_.-]+", key):
        raise ValueError("Configure TRIPO_API_KEY in the local environment or .local/tripo.env first.")
    if region not in API_HOSTS:
        raise ValueError("TRIPO_API_REGION must be global or cn.")
    return key, region


class NoRedirect(HTTPRedirectHandler):
    # In particular, Authorization may never follow a redirect to another host.
    def redirect_request(self, request, response, code, message, headers, new_url):
        return None


def official_code(payload):
    value = payload.get("code") if isinstance(payload, dict) else None
    if isinstance(value, int) and not isinstance(value, bool):
        return str(value)
    if isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9_-]{1,48}", value) and not value.lower().startswith("tsk_"):
        return value
    return "unavailable"


def api(method, path, payload=None, upload=None):
    key, region = config()
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    content_type = "application/json"
    if upload is not None:
        boundary = "trailbound-" + uuid.uuid4().hex
        extension = upload.suffix.lower()
        mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}[extension]
        body = (("--" + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="reference' +
                 extension + '"\r\nContent-Type: ' + mime + '\r\n\r\n').encode("utf-8") +
                upload.read_bytes() + ("\r\n--" + boundary + "--\r\n").encode("utf-8"))
        content_type = "multipart/form-data; boundary=" + boundary
    request = Request(API_HOSTS[region] + path, data=body, method=method, headers={
        "Authorization": "Bearer " + key,
        "Accept": "application/json",
        "Content-Type": content_type,
        "User-Agent": "trailbound-tripo-art/1",
    })
    try:
        # No retry: a timed-out task creation may already have consumed credits.
        with build_opener(NoRedirect()).open(request, timeout=90) as response:
            data = json.loads(response.read(4 * 1024 * 1024).decode("utf-8"))
    except HTTPError as error:
        code = "unavailable"
        try:
            code = official_code(json.loads(error.read(16384).decode("utf-8")))
        except (UnicodeError, ValueError, OSError):
            pass
        raise ValueError("Tripo API HTTP %s (code=%s); response body withheld." % (error.code, code)) from None
    except (URLError, TimeoutError, OSError):
        raise ValueError("Tripo API connection failed; request outcome may be uncertain. Do not resubmit blindly.") from None
    except (UnicodeError, json.JSONDecodeError):
        raise ValueError("Tripo returned an unreadable response; no response body was logged.") from None
    if not isinstance(data, dict) or data.get("code") not in (None, 0) or data.get("status") == "error":
        raise ValueError("Tripo API error (code=%s); response body withheld." % official_code(data))
    result = data.get("data", data)
    if not isinstance(result, dict):
        raise ValueError("Tripo returned an unexpected result format.")
    return result, region


def brief(asset_id):
    data = json.loads(BRIEFS.read_text(encoding="utf-8"))
    for item in data["assets"]:
        if item["id"] == identifier(asset_id):
            return item
    raise ValueError("Unknown asset. Use plan with an asset from art/tripo/asset-briefs.json.")


def task_payload(args):
    asset = brief(args.asset)
    if args.stage == "generate":
        if args.reference:
            if "image_generation" not in asset:
                raise ValueError("This asset has no image_generation brief.")
            return {"input": "LOCAL_REFERENCE_PENDING_EXPLICIT_SUBMIT", **asset["image_generation"]}
        return dict(asset["generation"])
    if args.reference:
        raise ValueError("--reference is only available for the generate stage.")
    if not args.source_task:
        raise ValueError("This stage needs --source-task; stages are never chained automatically.")
    source = identifier(args.source_task)
    if args.stage == "rig-check":
        return {"input": source}
    key = "rigging" if args.stage == "rig" else "animation"
    if key not in asset:
        raise ValueError("This asset has no %s brief." % key)
    return {"input": source, **asset[key]}


def receipt_path(task_id):
    return LOCAL / "tasks" / (identifier(task_id) + ".json")


def load_receipt(task_id):
    path = receipt_path(task_id)
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}


def task_status(task_id):
    task_id = identifier(task_id)
    result, region = api("GET", "/v3/tasks/" + quote(task_id, safe=""))
    if result.get("task_id") and str(result["task_id"]) != task_id:
        raise ValueError("Task response does not match the requested task.")
    return result, region


def model_outputs(output):
    """Accept the documented single URL and multi-animation URL collections."""
    found = []
    if not isinstance(output, dict):
        return found

    def add(label, value):
        if isinstance(value, dict):
            label = value.get("animation") or value.get("name") or label
            value = value.get("model_url") or value.get("url")
        if isinstance(value, str) and value and not any(item[1] == value for item in found):
            found.append((reference(label), value))

    add("model", output.get("model_url"))
    multiple = output.get("model_urls")
    if isinstance(multiple, dict):
        for label, value in multiple.items():
            add(label, value)
    elif isinstance(multiple, list):
        for index, value in enumerate(multiple):
            add("output-" + str(index), value)
    return found


def safe_task_summary(task_id, result, region):
    statuses = {"queued", "running", "success", "failed", "cancelled", "banned", "expired"}
    status = result.get("status")
    output = result.get("output") if isinstance(result.get("output"), dict) else {}
    return {
        "task_id": task_id, "status": status if status in statuses else "unknown",
        "progress": result.get("progress") if isinstance(result.get("progress"), (int, float)) else None,
        "credits_consumed": result.get("credits_consumed") if isinstance(result.get("credits_consumed"), (int, float)) else None,
        "riggable": output.get("riggable") if isinstance(output.get("riggable"), bool) else None,
        "model_outputs": [{"index": index, "label": label} for index, (label, _url) in enumerate(model_outputs(output))],
        "region": region, "queried_at": now(),
    }


def glb_summary(path):
    size = path.stat().st_size
    if size < 20 or size > MAX_MODEL_BYTES:
        raise ValueError("Model is empty, incomplete, or larger than the 150 MiB local limit.")
    with path.open("rb") as handle:
        magic, version, declared = struct.unpack("<4sII", handle.read(12))
        if magic != b"glTF" or version != 2 or declared != size:
            raise ValueError("Expected a complete binary glTF 2.0 (.glb), not an archive or an HTML page.")
        chunk_size, chunk_type = struct.unpack("<II", handle.read(8))
        if chunk_type != 0x4E4F534A or chunk_size > min(size - 20, 32 * 1024 * 1024):
            raise ValueError("GLB JSON chunk is invalid or too large.")
        model = json.loads(handle.read(chunk_size).decode("utf-8").rstrip("\x00 \t\r\n"))
    if not isinstance(model, dict) or not isinstance(model.get("meshes"), list) or not model["meshes"]:
        raise ValueError("GLB contains no model mesh.")
    for item in [*model.get("buffers", []), *model.get("images", [])]:
        if item.get("uri") and not str(item["uri"]).startswith("data:"):
            raise ValueError("GLB has external files; export an embedded, self-contained GLB from Blender first.")
    with path.open("rb") as handle:
        digest = hashlib.file_digest(handle, "sha256").hexdigest() if hasattr(hashlib, "file_digest") else None
        if digest is None:
            hasher = hashlib.sha256()
            for block in iter(lambda: handle.read(1024 * 1024), b""):
                hasher.update(block)
            digest = hasher.hexdigest()
    return {"bytes": size, "sha256": digest, "meshes": len(model.get("meshes", [])),
            "materials": len(model.get("materials", [])), "skins": len(model.get("skins", [])),
            "animations": [reference(item.get("name", "unnamed")) for item in model.get("animations", [])]}


def publish_temporary(temporary, destination):
    # Same-directory hard-link publication is atomic and refuses to overwrite an
    # existing asset, even if two commands happen to finish simultaneously.
    try:
        os.link(temporary, destination)
    except FileExistsError:
        raise ValueError("Output already exists; choose a new output name. Existing work was preserved.") from None


def license_record(note=""):
    return {"status": "pending-verification", "account_plan": None,
            "commercial_use_verified": False, "redistribution_verified": False,
            "reference": "https://www.tripo3d.ai/terms", "note": reference(note)}


def local_reference(value):
    path = Path(value).expanduser()
    path = (ROOT / path).resolve() if not path.is_absolute() else path.resolve()
    if not path.is_file() or path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise ValueError("Reference must be an existing PNG, JPEG or WebP file.")
    if not 16 <= path.stat().st_size <= 10 * 1024 * 1024:
        raise ValueError("Reference image must be a nonempty file of 10 MiB or smaller.")
    return path, {"name": path.name, "bytes": path.stat().st_size,
                  "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("plan", "submit"):
        command = commands.add_parser(name, help="offline payload preview" if name == "plan" else "CREATE ONE TASK; MAY SPEND CREDITS")
        command.add_argument("--asset", required=True)
        command.add_argument("--stage", choices=ROUTES, default="generate")
        command.add_argument("--source-task")
        command.add_argument("--reference", help="local image; uploaded only by explicit submit")
    commands.add_parser("balance", help="read-only balance query; confirms API authentication")
    for name in ("status", "download"):
        command = commands.add_parser(name, help="query once" if name == "status" else "download one completed GLB")
        command.add_argument("--task", required=True)
        if name == "download":
            command.add_argument("--asset", required=True)
            command.add_argument("--stage", choices=ROUTES, default="generate")
            command.add_argument("--out")
            selection = command.add_mutually_exclusive_group()
            selection.add_argument("--output-index", type=int, help="choose an actual GLB result; see status")
            selection.add_argument("--output-name", help="choose the exact result label listed by status")
    command = commands.add_parser("import", help="copy an existing GLB locally; no API or credits")
    command.add_argument("--asset", required=True)
    command.add_argument("--file", required=True)
    command.add_argument("--creator", required=True)
    command.add_argument("--source", required=True, help="original source or export provenance; never a signed download URL")
    command.add_argument("--source-task")
    command.add_argument("--model", help="claimed provider/model version, if known")
    command.add_argument("--license-note", default="")
    command.add_argument("--out")
    args = parser.parse_args()
    if getattr(args, "stage", None) == "animate":
        args.stage = "retarget"

    if args.command in {"plan", "submit"}:
        payload = task_payload(args)
        source_image, image_record = local_reference(args.reference) if args.reference else (None, None)
        route = IMAGE_ROUTE if source_image else ROUTES[args.stage]
        if args.command == "plan":
            print(json.dumps(clean_data({"asset": args.asset, "stage": args.stage, "method": "POST",
                              "path": route, "payload": payload, "reference": image_record,
                              "upload_path": "/v3/files" if source_image else None,
                              "network_sent": False, "credits": "not estimated; submit may spend credits"}),
                             ensure_ascii=False, indent=2))
            return
        submission = LOCAL / "submissions" / (str(uuid.uuid4()) + ".json")
        record = {"asset": args.asset, "stage": args.stage, "parameters": payload, "reference": image_record,
                  "requested_at": now(), "outcome": "uncertain-until-acknowledged", "sources": SOURCES}
        # This receipt exists before the single POST, including on timeout.
        atomic_json(submission, record)
        if source_image:
            uploaded, _ = api("POST", "/v3/files", upload=source_image)
            token = uploaded.get("file_token")
            if not isinstance(token, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,200}", token):
                raise ValueError("Reference upload returned no acceptable file_token.")
            payload["input"] = token
            record.update({"outcome": "reference-uploaded-generation-not-acknowledged", "parameters": payload})
            atomic_json(submission, record)
        result, region = api("POST", route, payload)
        task_id = identifier(result.get("task_id"))
        record.update({"task_id": task_id, "region": region, "outcome": "acknowledged"})
        atomic_json(submission, record)
        atomic_json(receipt_path(task_id), {**record, "license": license_record()})
        print(json.dumps({"task_id": task_id, "asset": args.asset, "stage": args.stage,
                          "receipt": str(receipt_path(task_id).relative_to(ROOT)),
                          "next": "status --task " + task_id}, ensure_ascii=False, indent=2))
        return

    if args.command == "balance":
        result, region = api("GET", "/v3/account/balance")
        if not isinstance(result.get("balance"), (int, float)):
            raise ValueError("Balance response did not contain an expected numeric balance.")
        print(json.dumps({"authenticated": True, "region": region, "balance": result["balance"],
                          "frozen": result.get("frozen") if isinstance(result.get("frozen"), (int, float)) else None,
                          "queried_at": now(), "generation_submitted": False}, indent=2))
        return

    if args.command == "status":
        result, region = task_status(args.task)
        summary = safe_task_summary(args.task, result, region)
        atomic_json(LOCAL / "status" / (identifier(args.task) + ".json"), summary)
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    brief(args.asset)
    if args.command == "download":
        result, region = task_status(args.task)
        summary = safe_task_summary(args.task, result, region)
        if summary["status"] != "success":
            raise ValueError("Task is not successful; no file was downloaded.")
        output = result.get("output", {})
        outputs = model_outputs(output)
        if not outputs:
            raise ValueError("Task has no model result URL.")
        selected = args.output_index
        if args.output_name is not None:
            matches = [index for index, item in enumerate(outputs) if item[0] == args.output_name]
            if len(matches) != 1:
                raise ValueError("Output name did not match exactly one model result; inspect status.")
            selected = matches[0]
        if selected is None:
            if len(outputs) != 1:
                raise ValueError("Task contains multiple GLBs; inspect status and choose --output-index or --output-name.")
            selected = 0
        if selected < 0 or selected >= len(outputs):
            raise ValueError("Output index is outside the model result list.")
        output_label, url = outputs[selected]
        parsed = urlsplit(url or "")
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError("Task has no acceptable HTTPS model_url.")
        try:
            address = ipaddress.ip_address(parsed.hostname)
        except ValueError:
            address = None
        if (address and not address.is_global) or parsed.hostname in {"localhost", "localhost.localdomain"} or parsed.hostname.endswith(".local"):
            raise ValueError("Private or local download hosts are not allowed.")
        suffix = "-" + re.sub(r"[^A-Za-z0-9_-]+", "-", output_label)[:50] if len(outputs) > 1 else ""
        destination = project_path(args.out) if args.out else LOCAL / "assets" / args.asset / (args.stage + "-" + args.task + suffix + ".glb")
        receipt = load_receipt(args.task)
        if receipt and (receipt.get("asset") != args.asset or receipt.get("stage") != args.stage):
            raise ValueError("Asset / stage does not match the local task receipt. Use the recorded task identity.")
        record = {**receipt, "provider": "tripo", "task_id": args.task,
                  "asset": args.asset, "stage": args.stage, "status": summary,
                  "output": {"index": selected, "label": output_label, "count": len(outputs)},
                  "parameters": receipt.get("parameters", {"status": "unknown-task-created-outside-this-tool"}),
                  "source": reference(url), "license": license_record(), "sources": SOURCES}
    else:
        source = Path(args.file).expanduser().resolve()
        if not source.is_file():
            raise ValueError("Source GLB does not exist.")
        inspected = glb_summary(source)
        destination = project_path(args.out) if args.out else LOCAL / "assets" / args.asset / ("import-" + inspected["sha256"][:12] + ".glb")
        record = {"provider": "user-provided", "asset": args.asset, "stage": "import",
                  "task_id": identifier(args.source_task) if args.source_task else None,
                  "claimed_model": reference(args.model or "unknown"), "creator": reference(args.creator),
                  "source": reference(args.source), "origin_independently_verified": False,
                  "license": license_record(args.license_note)}

    if destination.suffix.lower() != ".glb":
        raise ValueError("Output filename must end in .glb.")
    if destination.exists() or destination.with_suffix(".glb.json").exists():
        raise ValueError("Output already exists; choose a new name. Existing work was preserved.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=destination.name + ".", suffix=".tmp", dir=destination.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            if args.command == "download":
                # A separate request with no Authorization header. Signed CDN URLs
                # stay in memory and do not enter the receipt or terminal output.
                request = Request(url, headers={"User-Agent": "trailbound-tripo-art/1"})
                with build_opener(NoRedirect()).open(request, timeout=90) as response:
                    size = 0
                    while True:
                        block = response.read(1024 * 1024)
                        if not block:
                            break
                        size += len(block)
                        if size > MAX_MODEL_BYTES:
                            raise ValueError("Download exceeded the 150 MiB local limit.")
                        handle.write(block)
            else:
                with source.open("rb") as existing:
                    shutil.copyfileobj(existing, handle, 1024 * 1024)
            handle.flush()
            os.fsync(handle.fileno())
        record.update({"file": str(destination.relative_to(ROOT)), "saved_at": now(),
                       "glb": glb_summary(temporary), "art_review": "pending", "blender_refinement": "pending"})
        publish_temporary(temporary, destination)
        atomic_json(destination.with_suffix(".glb.json"), record)
    finally:
        temporary.unlink(missing_ok=True)
    print(json.dumps({"file": str(destination.relative_to(ROOT)), "glb": record["glb"],
                      "license": "pending-verification", "art_review": "pending"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print("Asset operation stopped: " + reference(str(error)), file=sys.stderr)
        sys.exit(1)
    except (OSError, HTTPError, URLError, struct.error):
        # Error objects can include signed URLs, provider response bodies or
        # credential-bearing paths. Keep them out of logs by design.
        print("Asset operation stopped. Existing source files were preserved. Check local configuration, task status and input/output paths; do not repeat an uncertain submit before checking the Tripo console.", file=sys.stderr)
        sys.exit(1)
