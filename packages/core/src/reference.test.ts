import { describe, expect, test } from "bun:test";
import { getAnchors } from "./anchors";
import { dayOfWeek } from "./date";
import { OBSERVED_INDONESIAN_SETTINGS, REFERENCE_YEARS } from "./reference.fixtures";
import { getSeason } from "./seasons";

// Golden tests against secondary reference sources (see ADR-0002 and reference.fixtures.ts).
describe.each(REFERENCE_YEARS.map((ref) => [ref.year, ref] as const))("reference %d", (_, ref) => {
  const settings = OBSERVED_INDONESIAN_SETTINGS;

  test("anchors", () => {
    const anchors = getAnchors(ref.year, settings);
    for (const [name, expected] of Object.entries(ref.anchors)) {
      expect({ name, date: anchors[name as keyof typeof anchors] }).toEqual({
        name,
        date: expected,
      });
    }
  });

  test("fixture sanity: Sundays are Sundays", () => {
    for (const [date] of ref.sundays) {
      expect({ date, weekday: dayOfWeek(date) }).toEqual({ date, weekday: 0 });
    }
  });

  test("season and week of Sundays", () => {
    for (const [date, season, week] of ref.sundays) {
      const info = getSeason(date, settings);
      expect({ date, season: info.season, week: info.week }).toEqual({ date, season, week });
    }
  });

  test("season and week of selected weekdays", () => {
    for (const [date, season, week] of ref.weekdays) {
      const info = getSeason(date, settings);
      expect({ date, season: info.season, week: info.week }).toEqual({ date, season, week });
    }
  });
});
