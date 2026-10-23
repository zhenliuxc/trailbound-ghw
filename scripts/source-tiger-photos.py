"""Prepare credited local photographs and typed metadata, without changing game saves."""
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOBS = [
    ("start", "Tiger Leaping Gorge trail 01.JPG", "桥头高路起点一带实拍 · 2008", "桥头村落与高路起点一带的实景"),
    ("tinas", "中虎跳 TINA‘S - panoramio.jpg", "中峡客栈建筑实拍 · 2011", "峡谷山壁前的中峡客栈，外墙保留原有客栈招牌"),
    ("river", "Middle Tiger Leaping Gorge - panoramio (3).jpg", "中虎跳江段实景 · 2004", "中虎跳的金沙江、江中巨石与两侧岩壁"),
]
FLICKR_JOBS = [
    ("bends", "https://www.flickr.com/photos/goosmurf/24039089569/", "tiger-bends-place-v2.jpg", "二十八道拐入口山路 · 历史实拍", "二十八道拐入口的石砌建筑、上行山路与二十八拐手写提示", "作者原题明确为当日的二十八道拐路段，画面可见二十八拐提示与上行山径；采用入口原貌，不声称是最高点全景。"),
    ("halfway", "https://www.flickr.com/photos/livepine/437155769/", "tiger-halfway-place-v1.jpg", "中途客栈建筑实拍 · 历史影像", "中途客栈的石砌墙面、瓦顶与招牌", "作者原题为中途旅店 / Halfway Hostel，画面可见 HALF WAY G.H. 建筑招牌。"),
    ("waterfall", "https://www.flickr.com/photos/livepine/437155777/", "tiger-longdong-place-v1.jpg", "龙洞瀑布 · 历史实拍", "龙洞瀑布沿岩壁跌落，徒步山径横穿瀑布，下方水流分叉落入沟谷", "作者原题为瀑布 / waterfall，未直接标注龙洞名称。地点根据与 Nick Kembel 明确命名为 Longdong waterfall 的对岸实拍进行地貌比对推定：横切主瀑布的山径、主瀑左侧向右伸出的楔形岩层，以及山径下方左右分叉的水道位置相符。保留原始标题，不把比对判断写成原作者定名。"),
]
LOCALITY = {
    "start": "作者原始说明为桥头高路起步段。",
    "tinas": "原题中虎跳 TINA‘S，画面可见 TINA'S G.H. 外墙招牌；Commons 记录原 Panoramio 许可审核。",
    "river": "原题明确为 Middle Tiger Leaping Gorge，画面对应中虎跳江段。",
}
UA = {"User-Agent": "Trailbound local asset preparation; Wikimedia Commons attribution retained"}

def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45)

def clean(value):
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()

query = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "1280", "titles": "|".join("File:" + j[1] for j in JOBS)})
pages = json.load(fetch("https://commons.wikimedia.org/w/api.php?" + query))["query"]["pages"]
infos = {page["title"]: page["imageinfo"][0] for page in pages.values() if page.get("imageinfo")}
records = {}
for key, title, caption, alt in JOBS:
    info = infos["File:" + title]
    metadata = info["extmetadata"]
    field = lambda name: clean(metadata.get(name, {}).get("value", ""))
    license_name = field("LicenseShortName")
    if license_name not in ("CC BY-SA 3.0", "CC BY-SA 2.0", "CC BY 2.0"):
        raise RuntimeError("Photograph needs a separate license decision: " + title)
    target = ROOT / "dist" / "photos" / ("tiger-" + key + ("-place-v1.jpg" if key == "tinas" else "-schematic-v1.jpg"))
    if not target.exists():
        target.write_bytes(fetch(info.get("thumburl", info["url"])).read())
    source = "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(title.replace(" ", "_"), safe="()")
    records[key] = {"file": "photos/" + target.name, "title": title, "caption": caption, "alt": alt,
        "author": "© BrokenSphere / Wikimedia Commons" if field("Artist") == "BrokenSphere" else field("Artist"), "license": license_name, "licenseUrl": field("LicenseUrl"), "source": source,
        "original": info["url"], "description": field("ImageDescription"), "locality": {"status": "verified", "basis": LOCALITY[key]}, "verifiedOn": str(date.today()),
        "modifications": "Commons 1280px 预览或原始 JPEG 打包，界面按容器比例裁切；照片沿用原许可。", "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}

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
        photo = flickr_photo(child, photo_id)
        if photo:
            return photo
    return None

for key, source, filename, caption, alt, basis in FLICKR_JOBS:
    page = fetch(source).read().decode("utf-8")
    match = re.search(r"modelExport\s*[:=]\s*", page)
    if not match:
        raise RuntimeError("Public Flickr photo metadata is unavailable: " + source)
    public_data = json.JSONDecoder().raw_decode(page[match.end():])[0]
    photo = flickr_photo(public_data, source.rstrip("/").split("/")[-1])
    if not photo or photo["license"] != 4:
        raise RuntimeError("The selected Flickr photo must retain CC BY 2.0: " + source)
    sizes = [size["data"] for size in photo["sizes"]["data"].values()]
    selected = max((size for size in sizes if size["width"] <= 1600), key=lambda size: size["width"])
    original = "https:" + selected["url"]
    target = ROOT / "dist/photos" / filename
    if not target.exists():
        with fetch(original) as response:
            content = response.read()
        if not content.startswith(b"\xff\xd8\xff"):
            raise RuntimeError("The photograph download is not a JPEG: " + source)
        target.write_bytes(content)
    owner = photo["owner"]["data"]
    records[key] = {"file": "photos/" + target.name, "title": clean(photo["title"]), "caption": caption, "alt": alt,
        "author": owner.get("realname") or owner["username"], "license": "CC BY 2.0", "licenseUrl": "https://creativecommons.org/licenses/by/2.0/", "source": source,
        "original": original, "description": basis, "locality": {"status": "verified", "basis": basis}, "verifiedOn": str(date.today()),
        "modifications": "Flickr 提供的 JPEG 尺寸版本直接打包，界面按容器比例裁切；无内容修补或生成。", "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}

records = {key: records[key] for key in ("start", "bends", "halfway", "waterfall", "tinas", "river")}
records["waterfall"]["locality"].update({
    "method": "landmark-comparison",
    "references": [{
        "source": "https://www.nickkembel.com/tiger-leaping-gorge-trek/",
        "section": "Bendiwan to Jiantang Village (End of Trail)",
        "caption": "Longdong waterfall viewed from directly across the valley",
        "image": "https://e5rxtr4t5ah.exactdn.com/wp-content/uploads/2025/08/longdong-waterfall-tiger-leaping.jpg?strip=all",
        "use": "仅作地点和岩壁比对，不随游戏打包或作为游戏实拍使用。",
    }],
})

(ROOT / "dist/photos/tiger-schematic-v1-credits.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
fields = ("file", "title", "caption", "alt", "author", "license", "licenseUrl", "source")
typed = {key: {k: record[k] for k in fields} for key, record in records.items()}
source = "// Generated by scripts/source-tiger-photos.py. Preserve attribution and locality boundaries.\n"
source += "export interface TigerPhoto { readonly file: string; readonly title: string; readonly caption: string; readonly alt: string; readonly author: string; readonly license: string; readonly licenseUrl: string; readonly source: string }\n"
source += "export const PHOTOS = " + json.dumps(typed, ensure_ascii=False, indent=2) + " satisfies Record<string, TigerPhoto>;\n"
source += "export type PhotoId = keyof typeof PHOTOS;\n"
(ROOT / "src/tiger-walk/photos.ts").write_text(source)
print("Prepared " + str(len(records)) + " credited local photographs and typed metadata.")
