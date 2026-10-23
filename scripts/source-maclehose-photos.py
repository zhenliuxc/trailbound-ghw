"""Prepare the four additional MacLehose landmark photographs and their credits."""
import hashlib
import html
import json
import re
import subprocess
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".local/maclehose-photo-research-8"
CACHE.mkdir(parents=True, exist_ok=True)
HEADERS = {"User-Agent": "Trailbound public photograph preparation; attribution retained"}
JOBS = [
    ("longke", "Long Ke Wan 3.jpg", "maclehose-longke-place-v8.webp", "浪茄湾与通向海湾的山径 · 2012 年实拍", "山径俯瞰浪茄湾、白沙滩、绿色岬角与蓝绿色海水", "原作者明确命名为 Long Ke Wan，Commons 记录拍摄位置 22.380612, 114.379627。照片展示浪茄湾，拍摄视角在上方山径，不声称从沙滩起步点拍摄。"),
    ("saiwanShan", "大浪湾 - Tai Long Wan - 2015.01 - panoramio.jpg", "maclehose-saiwan-shan-place-v8.webp", "西湾山观景处俯瞰海湾 · 2015 年实拍", "西湾山观景解说牌、下行石阶与远处相连的白沙湾和山脊", "画面前景可见西湾山观景台解说牌，Commons 分类为 Sai Wan Shan；原图拍摄坐标单独保留。不是海滩平视照片或柴湾同名山峰。"),
    ("pakTamAu", "Pak Tam Au 29-06-2022.jpg", "maclehose-paktamau-place-v8.webp", "北潭凹路口、林缘和远足路标 · 2022 年实拍", "北潭凹麦理浩径第二段与第三段路口，林缘、木路牌、地图牌和长椅", "原作者明确说明摄于 Pak Tam Au，画面路标标出第二段浪茄方向与第三段企岭下方向，符合本程终点路口。"),
]


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=40)


def clean(value):
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def webp(content, filename):
    source = CACHE / (filename + ".jpg")
    source.write_bytes(content)
    target = ROOT / "public/photos" / filename
    subprocess.run([
        "node", "--input-type=module", "-e",
        "import sharp from 'sharp'; await sharp(process.argv[1]).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:86}).toFile(process.argv[2]);",
        str(source), str(target),
    ], cwd=ROOT, check=True)
    return hashlib.sha256(target.read_bytes()).hexdigest()


query = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 1920, "titles": "|".join("File:" + job[1] for job in JOBS)})
pages = json.load(fetch("https://commons.wikimedia.org/w/api.php?" + query))["query"]["pages"]
infos = {page["title"]: page["imageinfo"][0] for page in pages.values() if page.get("imageinfo")}
records = {}
for key, title, filename, caption, alt, basis in JOBS:
    info = infos["File:" + title]
    metadata = info["extmetadata"]
    field = lambda name: clean(metadata.get(name, {}).get("value", ""))
    license_name = field("LicenseShortName")
    if license_name not in ("CC BY-SA 4.0", "CC BY 3.0"):
        raise RuntimeError("The selected photograph needs a new license review: " + title)
    download = info.get("thumburl", info["url"])
    content = fetch(download).read()
    records[key] = {
        "file": "photos/" + filename, "title": title, "caption": caption, "alt": alt,
        "author": field("Artist"), "license": license_name, "licenseUrl": field("LicenseUrl"),
        "source": info["descriptionurl"], "original": info["url"], "download": download,
        "date": field("DateTimeOriginal"), "description": field("ImageDescription"),
        "latitude": field("GPSLatitude"), "longitude": field("GPSLongitude"),
        "locality": {"status": "verified", "basis": basis},
        "verified": str(date.today()), "sha256": webp(content, filename),
        "modifications": "Original Commons image preview resized to at most 1600px wide and encoded to WebP. The game displays proportional container crops. No scene elements added or removed.",
    }


def flickr_photo(value, photo_id):
    if isinstance(value, dict):
        if str(value.get("id")) == photo_id and all(key in value for key in ("title", "license", "sizes", "owner")):
            return value
        children = value.values()
    elif isinstance(value, list):
        children = value
    else:
        return None
    for child in children:
        result = flickr_photo(child, photo_id)
        if result:
            return result
    return None


source = "https://www.flickr.com/photos/erictse2005/31766789434/"
page = fetch(source).read().decode("utf-8")
match = re.search(r"modelExport\s*[:=]\s*", page)
if not match:
    raise RuntimeError("Public Flickr photograph metadata is unavailable")
photo = flickr_photo(json.JSONDecoder().raw_decode(page[match.end():])[0], "31766789434")
if not photo or photo["license"] != 5:
    raise RuntimeError("The selected M040 photograph must retain CC BY-SA 2.0")
sizes = [value["data"] for value in photo["sizes"]["data"].values()]
selected = max((size for size in sizes if size["width"] <= 1920), key=lambda size: size["width"])
download = "https:" + selected["url"]
filename = "maclehose-tailongau-m040-v8.webp"
records["taiLongAu"] = {
    "file": "photos/" + filename, "title": clean(photo["title"]),
    "caption": "大浪坳附近的 M040 标距柱 · 2017 年实拍",
    "alt": "大浪坳附近麦理浩径第二段的 M040 标距柱，牌上可见格网编号 KK287817",
    "author": "eric (ericcwtse)", "license": "CC BY-SA 2.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
    "source": source, "original": download, "date": "2017-01-30",
    "description": "原作者标题记录 2017 年 1 月 30 日经西湾亭、咸田湾至赤径的徒步。照片为 M040 标距柱近景。",
    "locality": {
        "status": "verified-nearby-trail-marker",
        "basis": "照片中直接读出 M040 和 KK287817，位于大浪坳邻近的第二段主线，约在山口西侧数百米范围。采用实际标距柱，不称为山口全景、山口路牌或在山坳中心拍摄。",
        "references": ["https://www.lcsd.gov.hk/en/healthy/common/download/Hiking_scenery.pdf"],
    },
    "verified": str(date.today()), "sha256": webp(fetch(download).read(), filename),
    "modifications": "Flickr-provided photograph resized to at most 1600px wide and encoded to WebP. The game displays proportional container crops. No scene elements added or removed.",
}
records = {key: records[key] for key in ("longke", "saiwanShan", "taiLongAu", "pakTamAu")}
(ROOT / "public/photos/maclehose-landmarks-v8-credits.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
fields = ("file", "title", "caption", "alt", "author", "license", "licenseUrl", "source")
typed = {key: {field: record[field] for field in fields} for key, record in records.items()}
(ROOT / "src/maclehose-walk/landmark-photos.ts").write_text(
    "// Generated by scripts/source-maclehose-photos.py. Attribution and locality are recorded in photos/maclehose-landmarks-v8-credits.json.\n"
    + "export const LANDMARK_PHOTOS = " + json.dumps(typed, ensure_ascii=False, indent=2) + ";\n"
)
credits_file = ROOT / "public/photos/credits.json"
credits = json.loads(credits_file.read_text())
for key, record in records.items():
    credits["maclehose-" + key + "-v8"] = record
credits_file.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")
print("Prepared four credited MacLehose photographs; M040 remains explicitly labelled as a nearby trail marker.")
