#!/usr/bin/env python3
"""Build the local Wugong photo selection board from a saved Commons inventory."""
from concurrent.futures import ThreadPoolExecutor
from html import escape
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / 'art/wugong-research/commons-candidates.json'
OUTPUT = ROOT / 'dist/research/wugong-photos'
SELECTED = [4, 10, 11, 12, 15, 16, 19, 24, 28, 29, 30]
NOTES = {
    4: '作者标注金顶，画面为山顶附近远眺，不是金顶石碑特写。秋季照片，可作补图。',
    10: '近景草叶参考：叶片有宽度、弧度与相互遮挡，背后草坡连成色面。',
    11: '草甸覆盖参考：短草密集地铺在坡上，远处不需要逐根看清。',
    12: '当前已经使用的照片，保留为对照，避免在多个地点重复使用。',
    15: '陡坡照片候选：小路与爬升关系清楚，具体坡名仍需确认。',
    16: '草甸转弯照片候选：近处小路明确，也可参考阴天的光照。',
    19: '岩面与低矮植被参考，不认定为东江村入口。',
    24: '林线、松树和路边石头的参考，具体地点仍需核对。',
    28: '草甸质感首选参考：草坡连续柔和，山路贴着坡面，沟谷仍然清楚。',
    29: '山形、林线与近景草丛的参考，适合比较远近层次。',
    30: '光影参考，颜色和反差较强，不作为当前照片首选。',
}


def prepare(index, rows):
    row = rows[index]
    name = f'commons-{index:02}.jpg'
    target = OUTPUT / name
    if not target.exists():
        request = Request(row['thumbnail'], headers={'User-Agent': 'TrailboundPhotoResearch/1.0'})
        with urlopen(request, timeout=25) as response:
            target.write_bytes(response.read())
    return {**row, 'file': name, 'candidate': f'{index:02}'}


def main():
    rows = json.loads(INVENTORY.read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as executor:
        selected = list(executor.map(lambda index: prepare(index, rows), SELECTED))
    cards = []
    for photo in selected:
        label = '作者标注金顶，远眺画面' if photo['candidate'] == '04' else '区域实景，定点位置待核对'
        cards.append(f'''<figure><a href="{escape(photo['source'], quote=True)}" target="_blank" rel="noopener noreferrer"><img src="{photo['file']}" alt="候选 {photo['candidate']}：{escape(photo['description'], quote=True)}"></a><figcaption><p class="status">候选 {photo['candidate']} · {label}</p><h3>{escape(photo['title'].removeprefix('File:'))}</h3><p>{escape(NOTES[int(photo['candidate'])])}</p><p>{escape(photo['author'])} · {escape(photo['date'][:10])}</p><p><a href="{escape(photo['source'], quote=True)}" target="_blank" rel="noopener noreferrer">原图与拍摄说明</a> · <a href="{escape(photo['licenseUrl'], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(photo['license'])}</a></p></figcaption></figure>''')
    page = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>武功山 · 草甸与照片选型</title><style>
:root{color:#40584c;background:#f4f2e8;font:14px/1.8 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}*{box-sizing:border-box}body{margin:0}main{width:calc(100% - 48px);max-width:1440px;margin:36px auto 50px}a{color:#526e50;text-underline-offset:4px}header{border-bottom:1px solid #d2dac6;padding-bottom:22px}h1,h2,h3{font-family:"Songti SC",STSong,serif;font-weight:500}h1{font-size:29px;line-height:1.5;margin:6px 0 12px}h2{font-size:21px;margin:30px 0 12px}h3{font-size:16px;margin:7px 0;overflow-wrap:anywhere}.eyebrow,.status{color:#839274;font-size:12px}p{margin:8px 0}.lead{max-width:900px}.tech{display:grid;grid-template-columns:1fr 1fr;gap:18px}.tech article{background:#faf8ef;border:1px solid #d6ddc9;border-radius:12px;padding:18px 22px}.tech h3{font-size:19px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}figure{margin:0;border:1px solid #d6ddc9;border-radius:12px;overflow:hidden;background:#faf8ef}figure>a{display:block;background:#e0e5d6}img{display:block;width:100%;height:240px;object-fit:contain}figcaption{padding:12px 18px 18px}figcaption p{font-size:12px;color:#7b8b70}table{border-collapse:collapse;width:100%;background:#faf8ef}th,td{text-align:left;vertical-align:top;padding:11px 14px;border-bottom:1px solid #d8dfcd}th{font-size:12px;color:#849476;font-weight:500}td:first-child{white-space:nowrap}small{display:block;font-size:12px;color:#8a967d;margin:20px 0}@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){main{width:calc(100% - 28px);margin-top:24px}.tech,.grid{grid-template-columns:1fr}h1{font-size:24px}td,th{padding:10px 8px}img{height:230px}}
</style></head><body><main><header><p class="eyebrow">山径 / 武功山 / 选型与选片</p><h1>草甸应该连成一片，照片应该认得出地点。</h1><p class="lead">这页用于比较现成草甸方案与真实照片候选。游戏画面尚未替换；候选照片的地点确认、视觉选择和使用许可分别记录。</p><a href="#photos">查看照片候选 ↓</a> · <a href="../../wugong-walk.html?section=ridge">返回当前行走页 →</a></header>
<h2>草甸动画的现有方案</h2><section class="tech"><article><h3>Three.js · 成片草场</h3><p>用表面采样与实例化批量布草，共享风场让草尖弯曲。近处看叶片，远处合成柔和色面，适合需要体积感的草甸。</p><p><a href="https://al-ro.github.io/projects/grass/" target="_blank" rel="noopener noreferrer">风动草场演示</a> · <a href="https://github.com/Steve245270533/three-stylized" target="_blank" rel="noopener noreferrer">现成草场组件候选</a></p><p>工程已有 Three.js，当前行走页仍是 Canvas 2D，接入需要处理相同地形、投影和人物遮挡。尚未接入。</p></article><article><h3>PixiJS · 斜俯视草坡</h3><p>用 MeshPlane 或 Mesh 的网格形变表现草甸分层与风浪，适合保留当前斜俯视画面。草的轮廓、色块和密度仍需按武功山调整。</p><p><a href="https://pixijs.com/8.x/guides/components/scene-objects/mesh" target="_blank" rel="noopener noreferrer">官方网格与形变文档</a></p><p>工程已有 PixiJS。它提供绘制与形变能力，不是安装后便自动生成草甸的素材包。尚未接入当前样段。</p></article></section>
<h2>沿既定反穿路线选照片</h2><table><thead><tr><th>地点</th><th>照片中应看到什么</th></tr></thead><tbody><tr><td>东江村</td><td>村口、登山入口与林间路，作为出发记忆。</td></tr><tr><td>绝望坡</td><td>连续陡坡与坡面上真实的徒步小路，保留高差。</td></tr><tr><td>草甸转弯</td><td>能读清小路和草坡关系的近景，避免与上一站同图。</td></tr><tr><td>观音宕</td><td>可辨认的帐篷营地全貌；晚霞或夜色可作补图。</td></tr><tr><td>吊马桩</td><td>山口、石笋地貌与岔路口，区别于普通草坡。</td></tr><tr><td>金顶</td><td>金顶标志与所在山顶，再配一张回望远景。</td></tr><tr><td>景区大门</td><td>石鼓寺片区的武功山牌坊，明确旅程终点。</td></tr></tbody></table>
<p class="lead">公开游记中的上山支线和过夜点不完全一致。本页保留已确定的东江村 → 绝望坡 → 观音宕过夜 → 吊马桩 → 金顶 → 景区大门，不把龙山村或发云界顺带加入当前路线。</p>
<h2 id="photos">真实照片候选</h2><p>共筛出 11 张供对照。下列图片均保留作者、日期、原始页面及许可；可点击照片核对来源。除候选 04 外，其余原始说明仅支持“武功山区域”，不自动认定为某一景点。</p><div class="grid">''' + ''.join(cards) + '''</div>
<h2>已有地点参考，尚未取得图片使用授权</h2><p><a href="https://www.wugongshan.cn/page/strategyList%21info.htm?id=251" target="_blank" rel="noopener noreferrer">景区官网的观音宕帐篷营地参考</a> · <a href="https://zhongce.sina.com.cn/interface/article/view/57150/" target="_blank" rel="noopener noreferrer">新浪原创游记：星空栈道与观音宕</a> · <a href="https://bbs.xiaopeng.com/article/3742216?tidType=1" target="_blank" rel="noopener noreferrer">旅客原帖中的武功山山门实景</a></p><small>小红书与微博站内搜索在当前浏览器要求登录，未将笔记正文视为已读。景区官网本次浏览存在连接失败；其图片线索来自公开检索，仍需核对原页。未抓取社交平台照片、未发起作者联系，也未发布任何变更。</small>
</main></body></html>'''
    (OUTPUT / 'index.html').write_text(page)
    (OUTPUT / 'licenses.json').write_text(json.dumps(selected, ensure_ascii=False, indent=2))
    print(f'Prepared {len(selected)} photo candidates: {OUTPUT / "index.html"}')


if __name__ == '__main__':
    main()
