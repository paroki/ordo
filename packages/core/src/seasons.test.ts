import { describe, expect, test } from "bun:test";
import { getAnchors } from "./anchors";
import { addDays, dayOfWeek, type IsoDate, isoDate, yearOf } from "./date";
import { getSeason, type Season, seasonFromAnchors } from "./seasons";

describe("getSeason() spot checks, 2026", () => {
  const cases: [IsoDate, Season, number | undefined, boolean][] = [
    ["2026-01-03", "christmas", undefined, false],
    ["2026-01-11", "christmas", undefined, false], // Baptism of the Lord
    ["2026-01-12", "ordinary-time", 1, false],
    ["2026-01-18", "ordinary-time", 2, false],
    ["2026-02-15", "ordinary-time", 6, false],
    ["2026-02-17", "ordinary-time", 6, false], // Tuesday before Ash Wednesday
    ["2026-02-18", "lent", 0, false], // Ash Wednesday
    ["2026-02-21", "lent", 0, false],
    ["2026-02-22", "lent", 1, false],
    ["2026-03-28", "lent", 5, false],
    ["2026-03-29", "lent", 6, true], // Palm Sunday
    ["2026-04-01", "lent", 6, true],
    ["2026-04-02", "triduum", undefined, true], // Holy Thursday
    ["2026-04-03", "triduum", undefined, true],
    ["2026-04-04", "triduum", undefined, true],
    ["2026-04-05", "easter", 1, false], // Easter Sunday
    ["2026-04-11", "easter", 1, false],
    ["2026-04-12", "easter", 2, false],
    ["2026-05-23", "easter", 7, false],
    ["2026-05-24", "easter", 8, false], // Pentecost
    ["2026-05-25", "ordinary-time", 8, false], // Monday of Week 8 (Week 7 is omitted)
    ["2026-06-14", "ordinary-time", 11, false],
    ["2026-06-28", "ordinary-time", 13, false],
    ["2026-06-30", "ordinary-time", 13, false],
    ["2026-11-22", "ordinary-time", 34, false], // Christ the King
    ["2026-11-28", "ordinary-time", 34, false],
    ["2026-11-29", "advent", 1, false],
    ["2026-12-20", "advent", 4, false],
    ["2026-12-24", "advent", 4, false],
    ["2026-12-25", "christmas", undefined, false],
    ["2026-12-31", "christmas", undefined, false],
  ];

  test.each(cases)("%s -> %s (week %s, holy week %s)", (date, season, week, holyWeek) => {
    const info = getSeason(date);
    expect(info.season).toBe(season);
    expect(info.week).toBe(week);
    expect(info.holyWeek).toBe(holyWeek);
  });

  test("seasons without a week number omit the key entirely", () => {
    expect(getSeason("2026-04-02")).toEqual({ season: "triduum", holyWeek: true });
    expect(getSeason("2026-12-25")).toEqual({ season: "christmas", holyWeek: false });
  });
});

describe("getSeason() other years", () => {
  test("2025: Part II resumes at Week 10 after Pentecost (Week 9 is omitted)", () => {
    expect(getSeason("2025-03-02")).toMatchObject({ season: "ordinary-time", week: 8 });
    expect(getSeason("2025-03-04")).toMatchObject({ season: "ordinary-time", week: 8 });
    expect(getSeason("2025-03-05")).toMatchObject({ season: "lent", week: 0 });
    expect(getSeason("2025-06-08")).toMatchObject({ season: "easter", week: 8 });
    expect(getSeason("2025-06-09")).toMatchObject({ season: "ordinary-time", week: 10 });
    expect(getSeason("2025-11-23")).toMatchObject({ season: "ordinary-time", week: 34 });
    expect(getSeason("2025-11-30")).toMatchObject({ season: "advent", week: 1 });
  });

  test("Baptism of the Lord on a Monday (2018, Epiphany on Sunday)", () => {
    const settings = { epiphany: "sunday" } as const;
    expect(getSeason("2018-01-08", settings)).toMatchObject({ season: "christmas" });
    expect(getSeason("2018-01-09", settings)).toMatchObject({ season: "ordinary-time", week: 1 });
    expect(getSeason("2018-01-14", settings)).toMatchObject({ season: "ordinary-time", week: 2 });
  });

  test("Baptism of the Lord on a Sunday (2018, Epiphany on 6 January)", () => {
    expect(getSeason("2018-01-07")).toMatchObject({ season: "christmas" });
    expect(getSeason("2018-01-08")).toMatchObject({ season: "ordinary-time", week: 1 });
    expect(getSeason("2018-01-14")).toMatchObject({ season: "ordinary-time", week: 2 });
  });
});

function daysOfYear(year: number): IsoDate[] {
  const days: IsoDate[] = [];
  for (let day = 1; ; day++) {
    const date = isoDate(year, 1, day);
    if (yearOf(date) !== year) {
      return days;
    }
    days.push(date);
  }
}

const SEASON_ORDER: Season[] = [
  "christmas",
  "ordinary-time",
  "lent",
  "triduum",
  "easter",
  "ordinary-time",
  "advent",
  "christmas",
];

describe("seasons properties (1900-2200, both Epiphany settings)", () => {
  test("seasons follow the liturgical order without gaps or overlaps, and weeks behave", () => {
    for (const epiphany of ["jan6", "sunday"] as const) {
      for (let year = 1900; year <= 2200; year++) {
        const anchors = getAnchors(year, { epiphany });
        const days = daysOfYear(year).map((date) => ({
          date,
          ...seasonFromAnchors(date, anchors),
        }));

        // 1. The run-length encoded sequence of seasons is exactly the liturgical order.
        const runs: Season[] = [];
        for (const day of days) {
          if (runs[runs.length - 1] !== day.season) {
            runs.push(day.season);
          }
        }
        expect(runs).toEqual(SEASON_ORDER);

        // 2. Week numbers never decrease inside a season part, and Sundays advance by one.
        const sundaysOfOrdinaryTime = days.filter(
          (d) => d.season === "ordinary-time" && dayOfWeek(d.date) === 0,
        );
        const part1 = sundaysOfOrdinaryTime.filter((d) => d.date < anchors.ashWednesday);
        const part2 = sundaysOfOrdinaryTime.filter((d) => d.date > anchors.pentecost);
        expect(part1[0]?.week).toBe(2);
        for (const part of [part1, part2]) {
          for (let i = 1; i < part.length; i++) {
            expect(part[i]?.week).toBe((part[i - 1]?.week ?? 0) + 1);
          }
        }

        // 3. Christ the King is the 34th Sunday, and Part II never repeats a Part I week.
        expect(part2[part2.length - 1]?.week).toBe(34);
        expect(part2[part2.length - 1]?.date).toBe(anchors.christTheKing);
        const lastWeekOfPart1 = days.filter(
          (d) => d.season === "ordinary-time" && d.date < anchors.ashWednesday,
        );
        const firstWeekOfPart2 = days.find(
          (d) => d.season === "ordinary-time" && d.date > anchors.pentecost,
        );
        expect(firstWeekOfPart2?.week).toBeGreaterThan(
          lastWeekOfPart1[lastWeekOfPart1.length - 1]?.week ?? 0,
        );

        // 4. Advent, Lent and Easter weeks start on the right day.
        expect(getSeason(anchors.adventI, { epiphany })).toMatchObject({
          season: "advent",
          week: 1,
        });
        expect(getSeason(addDays(anchors.ashWednesday, 4), { epiphany })).toMatchObject({
          season: "lent",
          week: 1,
        });
        expect(getSeason(anchors.palmSunday, { epiphany })).toMatchObject({
          season: "lent",
          week: 6,
          holyWeek: true,
        });
        expect(getSeason(anchors.pentecost, { epiphany })).toMatchObject({
          season: "easter",
          week: 8,
        });
      }
    }
  }, 30_000);
});
