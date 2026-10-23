/** Shared boundaries between the typed runtime and the existing game/rendering modules. */
export type RouteId = 'wugong' | 'tiger' | 'aotai' | 'maclehose' | 'changping' | 'mogan' | 'westlake';
export type JourneyStatus = 'ready' | 'walking' | 'paused' | 'encounter' | 'finished' | 'retreated';
export type SceneName = 'photo' | 'minigame' | 'reward' | 'journal';
export type GameKind = 'wind' | 'creek' | 'rain' | 'footsteps' | 'clouds' | 'greet' | 'altar' | 'puzzle' | 'match' | 'sling' | 'depth' | 'packing' | 'score' | 'bells' | 'tiger-climb' | 'tiger-river' | 'tiger-rest' | 'tiger-passage';
export type AssetState = 'queued' | 'loading' | 'ready' | 'error' | 'cancelled';

export interface RouteSummary { id: RouteId; name: string }
export interface Moment {
  key: string;
  id: string;
  route: RouteId;
  place: string;
  title: string;
  memory: string;
  icon: string;
  tag?: string | null;
  edition?: number;
  earned?: boolean;
  artVersion?: number;
  createdAt?: number | null;
  elapsed?: number | null;
  progress?: number | null;
  weather?: string | null;
  captureArt?: string;
  artSource?: 'capture';
}
export interface MomentEntry {
  id: string;
  route: RouteId;
  name: string;
  place: string;
  condition?: string;
  interaction: string;
  icon: string;
  edition?: number;
  tag: string;
  memory: string;
  result: string;
  bonus?: boolean;
  artV5?: string;
  artV4?: string;
  badge?: string;
}
export interface MomentCatalog {
  CATALOG: MomentEntry[];
  MAX_MOMENTS: number;
  item(id: string): MomentEntry;
  hasTag(moment: Moment): boolean;
  tagArt(moment: Moment): string | null;
  loadMoments(storage: Storage | null): Moment[];
  saveMoments(storage: Storage | null, moments: Moment[]): boolean;
}
export interface JournalPage {
  entries: Moment[];
  total: number;
  totalAll: number;
  remaining: number;
}
export interface JournalData {
  PAGE_SIZE: number;
  page(moments: Moment[], route?: RouteId | 'all', limit?: number): JournalPage;
  remember(moments: Moment[], moment: Moment): { moments: Moment[]; status: 'unchanged' | 'full' | 'added' | 'upgraded' };
}
export interface AssetEntry {
  state: AssetState;
  image: HTMLImageElement;
  promise: Promise<AssetEntry>;
  onChange?: ((entry: AssetEntry) => void) | null;
}
export interface ImageCache {
  request(file: string | null | undefined, priority?: 'high' | 'low'): AssetEntry | null;
  prefetch(files: string[]): void;
}
export interface SoundPlayer {
  mini?(game: string, event: string, options?: { x?: number; index?: number }): boolean;
  interact?(kind: string, options: { x: number; icon: string; playType: string }): boolean;
  wind?(energy: number, complete: boolean): void;
}
export interface MiniInput {
  x?: number;
  y?: number;
  gesture?: 'drag' | 'tap';
  phase?: 'press' | 'release';
  dragged?: boolean;
  assist?: boolean;
  key?: boolean;
  dx?: number;
  dy?: number;
  action?: string;
  value?: number;
  viewWidth?: number;
  viewHeight?: number;
}
export interface GameEvent { serial: number; type: string; x: number; index?: number }
export interface MiniState {
  id: string;
  route: RouteId;
  kind: string;
  game?: GameKind;
  age: number;
  acted: boolean;
  dragging: boolean;
  gesture: string;
  done: boolean;
  x: number;
  y: number;
  play: { type: string; progress: number; complete: boolean; completedAt?: number | null; reduced?: boolean };
  events?: GameEvent[];
  gates?: number;
  caught?: number;
  stage?: string;
  near?: boolean;
  windNear?: boolean;
  camera?: { zoom: number };
  capture?: { ok: boolean };
  sling?: { charge: boolean; stage: string; angle: number; power: number };
}
/** Renderer internals stay owned by the existing renderer; the controller sees lifecycle data only. */
export interface MiniViewRefs {
  art?: boolean;
  wugong?: boolean;
  story?: boolean;
  mogan?: boolean;
  tiger?: boolean;
  directInput?: boolean;
  mountain?: boolean;
  waitsForArt?: boolean;
  contentState?: 'loading' | 'ready' | 'error';
  disposed?: boolean;
}
export interface MiniOutcome {
  id: string;
  edition?: number;
  earned: boolean;
  interaction: string;
  memory: string;
  title: string;
  captureArt?: string;
  artSource?: 'capture';
}
export type SvgFactory = (tag: string, attributes: Record<string, string | number | boolean>, parent?: Element) => SVGElement;
export interface MiniApi {
  create(entry: MomentEntry, options: { reduced: boolean; weather?: string }): MiniState;
  act(state: MiniState, input: MiniInput): MiniState;
  move(state: MiniState, input: MiniInput): MiniState;
  release(state: MiniState): MiniState;
  tick(state: MiniState, dt: number): MiniState;
  draw(svg: SvgFactory, parent: Element, entry: MomentEntry): MiniViewRefs;
  paint(refs: MiniViewRefs, state: MiniState, reduced: boolean): void;
  instruction(entry: MomentEntry): string;
  status(state: MiniState): string;
  outcome(state: MiniState, entry: MomentEntry): MiniOutcome;
  /** Optional ownership hooks for newly registered games with their own renderer/resources. */
  assets?(entry: MomentEntry): GameAssets;
  mount?(refs: MiniViewRefs, context: { pixi: unknown; host: HTMLElement; cache?: ImageCache; entry: MomentEntry }): void | Promise<void>;
  dispose?(refs: MiniViewRefs): void;
  /** Adapter-owned coordinates, controls and keys, shared by both renderer paths. */
  point?(refs: MiniViewRefs, point: MiniInput): MiniInput;
  present?(state: MiniState, refs: MiniViewRefs): void;
  key?(state: MiniState, key: string, phase: 'down' | 'up'): MiniState | null;
  /** Optional cursor following, without treating idle hover as an initial action. */
  hover?(state: MiniState, point: MiniInput): MiniState;
}
export interface GameAssets { scene?: string; actor?: string; front?: string; stone?: string; hint?: string }
export interface ActionControl { action: string; label: string; disabled?: boolean; primary?: boolean }
export interface StoryControls { speaker: string; line: string; primary?: ActionControl; secondary?: ActionControl; zoom?: boolean }
export interface ArtFlow { phase: string; kicker: string; counter: string; title: string; cue: string; controls: ActionControl[] }
export interface WugongFlow {
  phase: string; stage: string; counter?: string; count: number; total: number;
  unit: string; cue: string; hold: number; title: string; kicker: string; invitation: string;
  story?: boolean; controls?: StoryControls;
}
export interface WindFlow { phase: string; counter: string; cue: string; energy: number }
export interface WaterFlow { phase: string; count: number; total: number; pulse: number; cue: string }
export interface MiniPlatform {
  kinds: Record<string, GameKind>;
  artAssets: Partial<Record<GameKind, GameAssets>>;
  wugongAssets: Partial<Record<GameKind, GameAssets>>;
  waterAssets: Partial<Record<GameKind, GameAssets>>;
  windNames: string[];
  artFlow(state: MiniState): ArtFlow;
  wugongFlow(state: MiniState): WugongFlow;
  flow(state: MiniState): WindFlow;
  waterFlow(state: MiniState): WaterFlow;
  artKey(state: MiniState, key: string, phase?: 'up' | 'down'): MiniState;
  point(refs: MiniViewRefs, point: MiniInput): MiniInput;
  mount(refs: MiniViewRefs, pixi: unknown, host: HTMLElement, scene: AssetEntry | null, actor: AssetEntry | null, front: AssetEntry | null, hint?: AssetEntry | null): Promise<boolean>;
  dispose(refs: MiniViewRefs): void;
}
