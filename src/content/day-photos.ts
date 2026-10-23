import type { PlacePhoto } from '../journey/photo-dialog';

// Existing licensed photographs; uncertain camera locations remain explicit.
export const DAY_PHOTOS = {
  "changping-forest": {
    "title": "Xiaojin, Aba, Sichuan, China - panoramio (42).jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(42).jpg",
    "author": "jetsun",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "file": "photos/changping-forest.webp",
    "alt": "长坪沟溪边的苔木与针叶林",
    "caption": "长坪沟森林实拍 · 区域配图，非枯树滩定点"
  },
  "changping-valley": {
    "title": "Xiaojin, Aba, Sichuan, China - panoramio (52).jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(52).jpg",
    "author": "jetsun",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "file": "photos/changping-valley.webp",
    "alt": "长坪沟林间溪谷与山间云雾",
    "caption": "长坪沟溪谷实拍 · 区域配图，非红石阵定点"
  },
  "changping-meadow": {
    "title": "Xiaojin, Aba, Sichuan, China - panoramio (57).jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Xiaojin,_Aba,_Sichuan,_China_-_panoramio_(57).jpg",
    "author": "jetsun",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "file": "photos/changping-meadow.webp",
    "alt": "长坪沟开阔的花草地与山壁",
    "caption": "长坪沟草甸实拍 · 区域配图，未核准木骡子机位"
  },
  "mogan-bamboo": {
    "title": "Mount Mogan bamboo forest.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_bamboo_forest.jpg",
    "author": "Walter Grassroot",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/mogan-bamboo.webp",
    "alt": "莫干山云雾中的竹林",
    "caption": "莫干山竹林实拍 · 区域配图"
  },
  "mogan-path": {
    "title": "Mount Mogan Path3.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_Path3.jpg",
    "author": "Walter Grassroot",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/mogan-path.webp",
    "alt": "莫干山树林中的木制山间步道",
    "caption": "莫干山木制步道实拍 · 区域配图，非莫干岭石阶"
  },
  "mogan-stream": {
    "title": "Mount Mogan River.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Mogan_River.jpg",
    "author": "Walter Grassroot",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/mogan-stream.webp",
    "alt": "莫干山石间流淌的溪水",
    "caption": "莫干山溪水实拍 · 区域配图"
  },
  "westlake-creek": {
    "title": "Jiuxi 20161004.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Jiuxi_20161004.jpg",
    "author": "Tyg728",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/westlake-creek.webp",
    "alt": "九溪十八涧的溪流、树林与游人",
    "caption": "九溪十八涧溪流实拍 · 2016 年"
  },
  "westlake-path": {
    "title": "九溪十八涧.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:%E4%B9%9D%E6%BA%AA%E5%8D%81%E5%85%AB%E6%B6%A7.jpg",
    "author": "三猎",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/westlake-path.webp",
    "alt": "九溪十八涧树林中的石板步道",
    "caption": "九溪十八涧石径实拍"
  },
  "westlake-tea": {
    "title": "Longjing tea village Hangzhou.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Longjing_tea_village_Hangzhou.jpg",
    "author": "Niklas Dougherty",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "file": "photos/westlake-tea.webp",
    "alt": "龙井村的房屋与周围茶园",
    "caption": "龙井村与周围茶园实拍"
  }
} satisfies Record<string, PlacePhoto>;
