import type { AnchorName, Calendar, CalendarEntry, Rank, TimeColors } from "./calendar";
import type { LiturgicalDay } from "./candidates";
import type { IsoDate } from "./date";
import { generateDay, generateYear } from "./generate";

/**
 * Helpers for tests that use small synthetic calendars. Ids, ranks and colors here are test
 * data chosen to exercise a rule. They are not statements about the real calendar.
 */
export const TEST_TIME_COLORS: TimeColors = {
  seasons: {
    advent: "violet",
    christmas: "white",
    "ordinary-time": "green",
    lent: "violet",
    triduum: "red",
    easter: "white",
  },
  overrides: {
    "saturday-memorial-of-mary": { color: "white" },
    "advent-w3-sunday": { color: "violet", alternativeColors: ["rose"] },
  },
};

export function makeCalendar(
  entries: CalendarEntry[] = [],
  timeColors: TimeColors = TEST_TIME_COLORS,
): Calendar {
  return {
    calendar: "test",
    edition: "synthetic",
    source: { title: "synthetic test calendar", citation: "none", accessed: "2026-11-05" },
    timeColors,
    entries,
  };
}

export function fixed(
  id: string,
  month: number,
  day: number,
  rank: Rank,
  extra: Partial<CalendarEntry> = {},
): CalendarEntry {
  return { id, when: { kind: "fixed", month, day }, rank, color: "white", ...extra };
}

export function anchored(
  id: string,
  anchor: AnchorName,
  offset: number,
  rank: Rank,
  extra: Partial<CalendarEntry> = {},
): CalendarEntry {
  return { id, when: { kind: "anchor", anchor, offset }, rank, color: "white", ...extra };
}

export function dayOf(date: IsoDate, entries: CalendarEntry[]): LiturgicalDay {
  return generateDay(date, { calendar: makeCalendar(entries) });
}

export function yearOf(year: number, entries: CalendarEntry[]): LiturgicalDay[] {
  return generateYear(year, { calendar: makeCalendar(entries) });
}

export function statusOf(day: LiturgicalDay, id: string): string | undefined {
  return day.celebrations.find((c) => c.id === id)?.status;
}
