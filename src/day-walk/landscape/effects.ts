import type { DayRoute } from '../../journey/day-route';

export interface LandscapeFrame {
  readonly time: number;
  readonly reducedMotion: boolean;
  readonly weather: DayRoute['weather'][number]['kind'];
}

/** Nodes belong to the map world; the scene supplies its clock and destroys them. */
export interface LandscapeEffects {
  paint(frame: LandscapeFrame): void;
}
