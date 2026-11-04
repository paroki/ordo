import { describe, expect, test } from "bun:test";
import { DEFAULT_SETTINGS, resolveSettings } from "./settings";
import { getLiturgicalTime } from "./time";

describe("getLiturgicalTime()", () => {
  test("combines season, week, weekday and cycles", () => {
    expect(getLiturgicalTime("2026-04-05")).toEqual({
      date: "2026-04-05",
      season: "easter",
      week: 1,
      holyWeek: false,
      weekday: 0,
      sundayCycle: "A",
      weekdayCycle: "II",
    });
  });

  test("omits the week for seasons that have none", () => {
    const time = getLiturgicalTime("2026-12-25");
    expect(time.season).toBe("christmas");
    expect("week" in time).toBe(false);
    expect(time.weekday).toBe(5);
  });

  test("honors regional settings", () => {
    // With Epiphany on Sunday 4 January 2026 the Baptism is still on 11 January.
    expect(getLiturgicalTime("2026-01-11", { epiphany: "sunday" }).season).toBe("christmas");
    // In 2018 the Baptism moves to Monday 8 January.
    expect(getLiturgicalTime("2018-01-08", { epiphany: "sunday" }).season).toBe("christmas");
    expect(getLiturgicalTime("2018-01-08").season).toBe("ordinary-time");
  });
});

describe("resolveSettings()", () => {
  test("fills in defaults and does not mutate them", () => {
    expect(resolveSettings()).toEqual(DEFAULT_SETTINGS);
    expect(resolveSettings({ ascension: "sunday" })).toEqual({
      epiphany: "jan6",
      ascension: "sunday",
      corpusChristi: "thursday",
    });
    expect(DEFAULT_SETTINGS.ascension).toBe("thursday");
  });
});
