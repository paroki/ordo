import { type SundayCycle, sundayCycle, type WeekdayCycle, weekdayCycle } from "./cycles";
import { dayOfWeek, type IsoDate } from "./date";
import { getSeason, type SeasonInfo } from "./seasons";
import type { RegionalSettings } from "./settings";

/** Everything known about a date from the liturgical time alone (no celebrations yet). */
export type LiturgicalTime = SeasonInfo & {
  date: IsoDate;
  /** 0 = Sunday ... 6 = Saturday. */
  weekday: number;
  sundayCycle: SundayCycle;
  weekdayCycle: WeekdayCycle;
};

export function getLiturgicalTime(
  date: IsoDate,
  settings?: Partial<RegionalSettings>,
): LiturgicalTime {
  return {
    ...getSeason(date, settings),
    date,
    weekday: dayOfWeek(date),
    sundayCycle: sundayCycle(date),
    weekdayCycle: weekdayCycle(date),
  };
}
