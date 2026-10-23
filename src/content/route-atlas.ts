import type { RouteId } from '../runtime/contracts';
import type { LandmarkSymbol } from '../journey/landmark-symbol';
import { DAY_ROUTES } from './day-routes';

interface AtlasPlace {
  readonly name: string;
  readonly region: string;
  readonly symbol: LandmarkSymbol;
}

export const ROUTE_ATLAS = {
  wugong: { name: '武功山', region: '江西 · 萍乡', symbol: 'alpine-meadow' },
  tiger: { name: '虎跳峡', region: '云南 · 迪庆', symbol: 'rapids' },
  aotai: { name: '鳌太线', region: '陕西 · 秦岭', symbol: 'ridge' },
  maclehose: { name: '麦理浩径', region: '香港 · 西贡', symbol: 'beach' },
  changping: { name: '四姑娘山', region: DAY_ROUTES.changping.region, symbol: 'summit' },
  mogan: { name: '莫干山', region: DAY_ROUTES.mogan.region, symbol: 'bamboo' },
  westlake: { name: '九溪龙井', region: DAY_ROUTES.westlake.region, symbol: 'tea' },
} satisfies Record<RouteId, AtlasPlace>;
