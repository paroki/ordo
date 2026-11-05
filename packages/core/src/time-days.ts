import type { Anchors } from "./anchors";
import type { CandidateRank, Level } from "./candidates";
import { dayOfWeek, diffDays, type IsoDate } from "./date";
import type { SeasonInfo } from "./seasons";

/** A day of the Proper of Time. Derived by the engine, never stored as data (ADR-0003, 4e). */
export type TimeDay = { id: string; rank: CandidateRank; level: Level };

const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const HOLY_WEEK_DAYS = ["holy-monday", "holy-tuesday", "holy-wednesday"] as const;

function weekOf(info: SeasonInfo): number {
  if (info.week === undefined) {
    throw new Error(`season ${info.season} has no week`);
  }
  return info.week;
}

/** Named days that sit at levels 1 and 2 of the Table (n. 59). Undefined for other dates. */
function namedDay(date: IsoDate, a: Anchors): TimeDay | undefined {
  if (date === a.holyThursday) return { id: "holy-thursday", rank: "triduum", level: 1 };
  if (date === a.goodFriday) return { id: "good-friday", rank: "triduum", level: 1 };
  if (date === a.holySaturday) return { id: "holy-saturday", rank: "triduum", level: 1 };
  if (date === a.easter) return { id: "easter-sunday", rank: "sunday", level: 2 };
  if (date === a.pentecost) return { id: "pentecost", rank: "solemnity", level: 2 };
  if (date === a.ascension) return { id: "ascension", rank: "solemnity", level: 2 };
  if (date === a.palmSunday) return { id: "palm-sunday", rank: "sunday", level: 2 };
  if (date === a.ashWednesday) return { id: "ash-wednesday", rank: "weekday", level: 2 };

  const afterPalm = diffDays(date, a.palmSunday);
  const holyWeekDay = HOLY_WEEK_DAYS[afterPalm - 1];
  if (afterPalm >= 1 && holyWeekDay !== undefined) {
    return { id: holyWeekDay, rank: "weekday", level: 2 };
  }

  // The days within the Easter octave (n. 59 level 2; n. 24 and ADR-0003 R15).
  const afterEaster = diffDays(date, a.easter);
  if (afterEaster >= 1 && afterEaster <= 6) {
    const name = WEEKDAY_NAMES[dayOfWeek(date)];
    return { id: `easter-octave-${name}`, rank: "solemnity", level: 2 };
  }
  return undefined;
}

function sundayDay(date: IsoDate, a: Anchors, info: SeasonInfo): TimeDay {
  if (info.season === "christmas") {
    // The Sunday of the octave of Christmas, or the Sunday between 2 January and Epiphany.
    const ordinal = date >= a.christmas || date.slice(5) === "01-01" ? 1 : 2;
    return { id: `christmas-sunday-${ordinal}`, rank: "sunday", level: 6 };
  }
  // Table level 2: Sundays of Advent, Lent and Easter. Level 6: Sundays of Ordinary Time.
  const level: Level = info.season === "ordinary-time" ? 6 : 2;
  return { id: `${info.season}-w${weekOf(info)}-sunday`, rank: "sunday", level };
}

function weekdayDay(date: IsoDate, a: Anchors, info: SeasonInfo): TimeDay {
  const name = WEEKDAY_NAMES[dayOfWeek(date)];
  const dayOfMonth = date.slice(8, 10);
  switch (info.season) {
    case "advent":
      // Level 9 from 17 to 24 December, level 13 before.
      return Number(dayOfMonth) >= 17
        ? { id: `advent-dec-${dayOfMonth}`, rank: "weekday", level: 9 }
        : { id: `advent-w${weekOf(info)}-${name}`, rank: "weekday", level: 13 };
    case "christmas":
      if (date >= a.christmas) {
        return { id: `christmas-dec-${dayOfMonth}`, rank: "weekday", level: 9 };
      }
      // 1 January closes the octave (level 9). From 2 January the days are level 13.
      return date.slice(5) === "01-01"
        ? { id: "christmas-jan-01", rank: "weekday", level: 9 }
        : { id: `christmas-jan-${dayOfMonth}`, rank: "weekday", level: 13 };
    case "lent":
      return { id: `lent-w${weekOf(info)}-${name}`, rank: "weekday", level: 9 };
    case "easter":
      return { id: `easter-w${weekOf(info)}-${name}`, rank: "weekday", level: 13 };
    case "ordinary-time":
      return { id: `ordinary-time-w${weekOf(info)}-${name}`, rank: "weekday", level: 13 };
    case "triduum":
      throw new Error(`unexpected unnamed day in the Triduum: ${date}`);
  }
}

/**
 * The day of the Proper of Time that every date has, whatever the calendar lists on it.
 * Levels follow the Table of Liturgical Days (Universal Norms n. 59).
 */
export function timeDay(date: IsoDate, a: Anchors, info: SeasonInfo): TimeDay {
  const named = namedDay(date, a);
  if (named !== undefined) return named;
  return dayOfWeek(date) === 0 ? sundayDay(date, a, info) : weekdayDay(date, a, info);
}
