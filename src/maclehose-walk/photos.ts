import type { PlacePhoto } from '../journey/photo-dialog';
import type { CheckpointId } from '../content/maclehose-map';
import { LANDMARK_PHOTOS } from './landmark-photos';

type CoastPhoto = PlacePhoto & { readonly name: string; readonly position: string };

export const PHOTOS = {
  longke:{...LANDMARK_PHOTOS.longke,name:'浪茄',position:'78% 63%'},
  saiwanShan:{...LANDMARK_PHOTOS.saiwanShan,name:'西湾山',position:'50% 55%'},
  saiwan:{file:'photos/maclehose-saiwan.webp',title:'Sai Wan.jpg',name:'西湾',caption:'西湾沙滩、海浪与岬角',alt:'西湾白色沙滩、海浪和绿色岬角',author:'Smallpei',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',source:'https://commons.wikimedia.org/wiki/File:Sai_Wan.jpg',position:'50% 50%'},
  hamtin:{file:'photos/maclehose-hamtin.webp',title:'Ham Tin Wan beach.jpg',name:'咸田湾',caption:'咸田湾海滩实拍',alt:'咸田湾沙滩和开阔海湾',author:'Kaldari',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',source:'https://commons.wikimedia.org/wiki/File:Ham_Tin_Wan_beach.jpg',position:'50% 50%'},
  taiLongAu:{...LANDMARK_PHOTOS.taiLongAu,name:'大浪坳',position:'50% 50%'},
  chekKeng:{file:'photos/maclehose-chekkeng-pier-v2.webp',title:'Chek Keng Pier 2010.jpg',name:'赤径',caption:'赤径码头与内湾，拍摄于 2010 年',alt:'赤径码头的系桩、石阶、防波堤与身后的绿色山坡',author:'維基百科用戶-Wpcpey',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',source:'https://commons.wikimedia.org/wiki/File:Chek_Keng_Pier_2010.jpg',position:'50% 50%'},
  pakTamAu:{...LANDMARK_PHOTOS.pakTamAu,name:'北潭凹',position:'50% 50%'},
} satisfies Record<CheckpointId,CoastPhoto>;
