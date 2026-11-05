import { type Anchors, getAnchors } from "./anchors";
import type { Calendar, CalendarEntry, TimeColor } from "./calendar";
import type { LiturgicalDay } from "./candidates";
import { sundayCycle, weekdayCycle } from "./cycles";
import { addDays, dayOfWeek, diffDays, type IsoDate, isoDate, yearOf } from "./date";
import {
  compare,
  type DayWork,
  entryLevel,
  primaryOf,
  resolveDay,
  toCandidate,
  transferImpeded,
  type Work,
} from "./precedence";
import { type SeasonInfo, seasonFromAnchors } from "./seasons";
import type { RegionalSettings } from "./settings";
import { timeDay } from "./time-days";

export type GenerateOptions = {
  calendar: Calendar;
  settings?: Partial<RegionalSettings>;
};

/** Id of the optional Saturday memorial of the Blessed Virgin Mary (n. 15, R11). */
export const SATURDAY_MARY_ID = "saturday-memorial-of-mary";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function entryDate(entry: CalendarEntry, year: number, a: Anchors): IsoDate {
  const { when } = entry;
  if (when.kind === "anchor") {
    return addDays(a[when.anchor], when.offset);
  }
  const date = isoDate(year, when.month, when.day);
  if (date !== `${String(year).padStart(4, "0")}-${pad2(when.month)}-${pad2(when.day)}`) {
    throw new Error(`entry ${entry.id}: ${when.month}/${when.day} does not exist in ${year}`);
  }
  return date;
}

function isActive(entry: CalendarEntry, year: number): boolean {
  return (
    (entry.validFrom === undefined || year >= entry.validFrom) &&
    (entry.validUntil === undefined || year <= entry.validUntil)
  );
}

function timeColor(calendar: Calendar, id: string, info: SeasonInfo): TimeColor {
  return calendar.timeColors.overrides?.[id] ?? { color: calendar.timeColors.seasons[info.season] };
}

function entryWork(entry: CalendarEntry): Work {
  const work: Work = {
    id: entry.id,
    rank: entry.rank,
    level: entryLevel(entry),
    color: entry.color,
    alternativeColors: entry.alternativeColors ?? [],
    status: "pending",
    origin: "calendar",
    movable: entry.when.kind === "anchor",
    entry,
  };
  return work;
}

function baseWorks(date: IsoDate, a: Anchors, info: SeasonInfo, calendar: Calendar): Work[] {
  const day = timeDay(date, a, info);
  const color = timeColor(calendar, day.id, info);
  const works: Work[] = [
    {
      ...day,
      color: color.color,
      alternativeColors: color.alternativeColors ?? [],
      status: "pending",
      origin: "time",
      movable: false,
    },
  ];

  // R11 (n. 15): on Saturdays of Ordinary Time an optional memorial of the Blessed Virgin
  // Mary is allowed. When an obligatory memorial or a higher day is there it is suppressed.
  if (info.season === "ordinary-time" && dayOfWeek(date) === 6) {
    const mary = calendar.timeColors.overrides?.[SATURDAY_MARY_ID];
    if (mary === undefined) {
      throw new Error(`timeColors.overrides must define ${SATURDAY_MARY_ID}`);
    }
    works.push({
      id: SATURDAY_MARY_ID,
      rank: "optional-memorial",
      level: 12,
      color: mary.color,
      alternativeColors: mary.alternativeColors ?? [],
      status: "pending",
      origin: "rule",
      movable: false,
    });
  }
  return works;
}

/** Generates every day of a civil year: candidates, statuses, the primary and its color. */
export function generateYear(year: number, options: GenerateOptions): LiturgicalDay[] {
  const { calendar } = options;
  const a = getAnchors(year, options.settings);
  const first = isoDate(year, 1, 1);
  const count = diffDays(isoDate(year + 1, 1, 1), first);

  const days = new Map<IsoDate, DayWork>();
  const infos = new Map<IsoDate, SeasonInfo>();
  for (let i = 0; i < count; i++) {
    const date = addDays(first, i);
    const info = seasonFromAnchors(date, a);
    infos.set(date, info);
    days.set(date, { date, season: info.season, works: baseWorks(date, a, info, calendar) });
  }

  const seen = new Set<string>();
  for (const entry of calendar.entries) {
    if (!isActive(entry, year)) continue;
    if (seen.has(entry.id)) {
      throw new Error(`duplicate active entry id ${entry.id} in ${year}`);
    }
    seen.add(entry.id);
    const date = entryDate(entry, year, a);
    const day = days.get(date);
    if (day === undefined || yearOf(date) !== year) {
      throw new Error(`entry ${entry.id} falls outside ${year}: ${date}`);
    }
    day.works.push(entryWork(entry));
  }

  for (const day of days.values()) resolveDay(day);
  transferImpeded(days, year, a);

  const result: LiturgicalDay[] = [];
  for (const [date, day] of days) {
    const info = infos.get(date);
    const primary = primaryOf(day.works);
    if (info === undefined || primary === undefined) {
      throw new Error(`unresolved day ${date}`);
    }
    day.works.sort(compare);
    const celebrations = day.works.map(toCandidate);
    const primaryCandidate = celebrations.find(
      (c) => c.id === primary.id && c.status === primary.status,
    );
    if (primaryCandidate === undefined) {
      throw new Error(`primary missing on ${date}`);
    }
    result.push({
      ...info,
      date,
      weekday: dayOfWeek(date),
      sundayCycle: sundayCycle(date),
      weekdayCycle: weekdayCycle(date),
      celebrations,
      primary: primaryCandidate,
      color: primaryCandidate.color,
      alternativeColors: primaryCandidate.alternativeColors,
    });
  }
  return result;
}

/** Generates one day. The whole civil year is resolved, because transfers cross days. */
export function generateDay(date: IsoDate, options: GenerateOptions): LiturgicalDay {
  const found = generateYear(yearOf(date), options).find((d) => d.date === date);
  if (found === undefined) {
    throw new Error(`date ${date} is not a valid civil date`);
  }
  return found;
}
