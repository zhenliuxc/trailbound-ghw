import type { ScrollJourney } from './scroll/journey';
import { clamp, mix, smooth } from '../journey/geometry';

export type EnvironmentJourney = Pick<ScrollJourney, 'day' | 'hour' | 'mode'>;

export type TimeSetting = 'journey' | 'dawn' | 'day' | 'dusk' | 'night';
export type WeatherSetting = 'journey' | 'clear' | 'cloud' | 'mist' | 'drizzle';
type Weather = Exclude<WeatherSetting, 'journey'>;
type Color = readonly [number, number, number];
interface WeatherProfile { cloud: number; fog: number; rain: number; wind: number }
export interface EnvironmentFrame extends Readonly<WeatherProfile> {
  readonly elapsed: number; readonly day: 1 | 2; readonly hour: number;
  readonly night: number; readonly warmth: number; readonly wet: number;
  readonly weather: Weather; readonly label: string;
  readonly skyTop: string; readonly skyBottom: string; readonly distantTop: string; readonly distantBottom: string;
}
const weatherProfiles: Record<Weather, WeatherProfile> = {
  clear: { cloud: .12, fog: .06, rain: 0, wind: .50 },
  cloud: { cloud: .70, fog: .15, rain: 0, wind: .78 },
  mist: { cloud: .55, fog: .78, rain: 0, wind: .38 },
  drizzle: { cloud: .87, fog: .40, rain: .70, wind: .93 },
};
const weatherNames: Record<Weather, string> = { clear: '晴', cloud: '云影经过', mist: '山间薄雾', drizzle: '山间小雨' };
const weatherTrack: readonly { hour: number; weather: Weather }[] = [
  { hour: 8, weather: 'clear' }, { hour: 10.7, weather: 'cloud' }, { hour: 12.4, weather: 'mist' },
  { hour: 14.4, weather: 'drizzle' }, { hour: 16.3, weather: 'cloud' }, { hour: 18.4, weather: 'clear' },
  { hour: 22, weather: 'clear' }, { hour: 29.8, weather: 'mist' }, { hour: 31.8, weather: 'cloud' },
  { hour: 33.3, weather: 'drizzle' }, { hour: 35, weather: 'cloud' }, { hour: 38.5, weather: 'clear' },
];
const timeHours: Record<Exclude<TimeSetting, 'journey'>, number> = { dawn: 6.1, day: 11.5, dusk: 18.2, night: 21.3 };
const color = (a: Color, b: Color, t: number) => `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(',')})`;
function forecast(hour: number): WeatherProfile {
  const first = weatherTrack[0], last = weatherTrack[weatherTrack.length - 1];
  if (hour <= first.hour) return weatherProfiles[first.weather];
  for (let i = 1; i < weatherTrack.length; i++) {
    const a = weatherTrack[i - 1], b = weatherTrack[i];
    if (hour > b.hour) continue;
    const u = smooth((hour - a.hour) / (b.hour - a.hour)), from = weatherProfiles[a.weather], to = weatherProfiles[b.weather];
    return { cloud: mix(from.cloud, to.cloud, u), fog: mix(from.fog, to.fog, u), rain: mix(from.rain, to.rain, u), wind: mix(from.wind, to.wind, u) };
  }
  return weatherProfiles[last.weather];
}
export function parseTimeSetting(value: string): TimeSetting {
  switch (value) { case 'dawn': case 'day': case 'dusk': case 'night': return value; default: return 'journey'; }
}
export function parseWeatherSetting(value: string): WeatherSetting {
  switch (value) { case 'clear': case 'cloud': case 'mist': case 'drizzle': return value; default: return 'journey'; }
}

export class SceneEnvironment {
  private hours: number;
  private elapsed = 0;
  private wet = 0;
  private profile: WeatherProfile;
  private day: 1 | 2;
  private time: TimeSetting = 'journey';
  private weather: WeatherSetting = 'journey';
  constructor(model: EnvironmentJourney) { this.hours = model.hour; this.day = model.day; this.profile = forecast(this.hours); }
  setTime(setting: TimeSetting): void { this.time = setting; }
  setWeather(setting: WeatherSetting): void { this.weather = setting; }
  reset(model: EnvironmentJourney): void {
    this.elapsed = 0; this.wet = 0; this.hours = this.time === 'journey' ? model.hour : (model.day - 1) * 24 + timeHours[this.time];
    this.day = model.day; this.profile = this.weather === 'journey' ? forecast(this.hours) : weatherProfiles[this.weather];
  }
  advance(dt: number, model: EnvironmentJourney): void {
    if (model.mode.kind === 'visiting' || model.mode.kind === 'encounter') return;
    this.elapsed += dt; this.day = model.day;
    const target = this.time === 'journey' ? model.hour : (model.day - 1) * 24 + timeHours[this.time];
    this.hours = mix(this.hours, target, 1 - Math.exp(-dt * .65));
    const profile = this.weather === 'journey' ? forecast(this.hours) : weatherProfiles[this.weather], rate = 1 - Math.exp(-dt * .42);
    this.profile = { cloud: mix(this.profile.cloud, profile.cloud, rate), fog: mix(this.profile.fog, profile.fog, rate), rain: mix(this.profile.rain, profile.rain, rate), wind: mix(this.profile.wind, profile.wind, rate) };
    this.wet = mix(this.wet, this.profile.rain, 1 - Math.exp(-dt * (this.profile.rain > this.wet ? .09 : .025)));
  }
  get frame(): EnvironmentFrame {
    const hour = this.hours % 24, p = this.profile;
    const night = 1 - smooth((hour - 5.2) / 1.6) + smooth((hour - 18.6) / 1.6);
    const dawn = Math.exp(-(((hour - 6.1) / 1.1) ** 2)), dusk = Math.exp(-(((hour - 18.2) / 1.4) ** 2));
    const warmth = Math.max(dawn * .72, dusk) * (1 - p.cloud * .35);
    const weather: Weather = p.rain > .24 ? 'drizzle' : p.fog > .43 ? 'mist' : p.cloud > .42 ? 'cloud' : 'clear';
    const day: 1 | 2 = this.time === 'journey' ? this.hours >= 24 ? 2 : 1 : this.day;
    const minute = Math.floor(hour * 12) * 5, clock = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
    return {
      ...p, elapsed: this.elapsed, day, hour, night, warmth, wet: this.wet, weather,
      wind: p.wind * (.90 + Math.sin(this.elapsed * .65) * .12 + Math.sin(this.elapsed * .23 + 1) * .08),
      label: `第${day === 1 ? '一' : '二'}天 ${clock} · ${weatherNames[weather]}`,
      skyTop: color([mix(195, 223, warmth), mix(216, 197, warmth), mix(220, 179, warmth)], [49, 68, 88], night),
      skyBottom: color([mix(231, 239, warmth), mix(234, 213, warmth), mix(214, 175, warmth)], [111, 137, 148], night),
      distantTop: color([mix(173, 192, warmth), mix(195, 187, warmth), mix(197, 166, warmth)], [80, 108, 125], night),
      distantBottom: color([211, 221, 208], [120, 147, 153], night),
    };
  }
}
