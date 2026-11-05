import { describe, expect, test } from "bun:test";
import type { Calendar, CalendarEntry, Rank } from "./calendar";
import type { CandidateStatus, LiturgicalDay } from "./candidates";
import { addDays, type IsoDate } from "./date";
import { generateDay, generateYear } from "./generate";
import { anchored, fixed, makeCalendar } from "./test-calendar";
import { getLiturgicalTime } from "./time";

/**
 * Property tests over the years 2000 to 2100 on a synthetic calendar built to collide with
 * the Proper of Time as often as possible. Ids, ranks and dates are test data, not facts.
 */
const FIRST_YEAR = 2000;
const LAST_YEAR = 2100;

const JOSEPH_RULE = {
  from: { anchor: "palmSunday" },
  to: { anchor: "easter", offset: 7 },
  target: { anchor: "palmSunday", offset: -1 },
} as const;
const ANNUNCIATION_RULE = {
  from: { anchor: "palmSunday" },
  to: { anchor: "easter", offset: 7 },
  target: { anchor: "easter", offset: 8 },
} as const;

function syntheticEntries(): CalendarEntry[] {
  const entries: CalendarEntry[] = [
    fixed("test-solemnity-a", 3, 19, "solemnity", { transfers: [JOSEPH_RULE] }),
    fixed("test-solemnity-b", 3, 25, "solemnity", { transfers: [ANNUNCIATION_RULE] }),
    fixed("test-solemnity-c", 12, 8, "solemnity"),
    fixed("test-solemnity-d", 6, 24, "solemnity"),
    fixed("test-solemnity-e", 11, 2, "solemnity"),
    fixed("test-solemnity-f", 8, 15, "solemnity"),
    fixed("test-solemnity-g", 11, 1, "solemnity"),
    fixed("test-nativity-like", 12, 25, "solemnity", { level: 2 }),
    anchored("test-epiphany-like", "epiphany", 0, "solemnity", { level: 2 }),
    anchored("test-trinity-like", "trinitySunday", 0, "solemnity"),
    anchored("test-corpus-like", "corpusChristi", 0, "solemnity"),
    anchored("test-heart-like", "sacredHeart", 0, "solemnity"),
    anchored("test-king-like", "christTheKing", 0, "solemnity"),
    anchored("test-family-like", "holyFamily", 0, "feast", { lord: true }),
    anchored("test-baptism-like", "baptismOfTheLord", 0, "feast", { lord: true }),
    anchored("test-movable-memorial", "immaculateHeart", 0, "memorial"),
    fixed("test-lord-feast-a", 2, 2, "feast", { lord: true }),
    fixed("test-lord-feast-b", 8, 6, "feast", { lord: true }),
    fixed("test-lord-feast-c", 9, 14, "feast", { lord: true }),
    fixed("test-lord-feast-d", 11, 9, "feast", { lord: true }),
  ];
  // A spread of feasts, memorials and optional memorials over the whole year.
  const ranks: Rank[] = ["feast", "memorial", "memorial", "optional-memorial", "optional-memorial"];
  for (let i = 0; i < 90; i++) {
    const rank = ranks[i % ranks.length] as Rank;
    entries.push(fixed(`test-spread-${i}`, (i % 12) + 1, ((i * 7) % 28) + 1, rank));
  }
  return entries;
}

const calendar: Calendar = makeCalendar(syntheticEntries());
const solemnityIds = calendar.entries.filter((e) => e.rank === "solemnity").map((e) => e.id);

const STATUSES: CandidateStatus[] = [
  "celebrated",
  "optional",
  "suppressed",
  "transferred-out",
  "transferred-in",
];

const years: Map<number, LiturgicalDay[]> = new Map();
for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
  years.set(y, generateYear(y, { calendar }));
}

function allDays(): LiturgicalDay[] {
  return [...years.values()].flat();
}

describe("properties of generateYear, 2000-2100", () => {
  test("every day of the year is present, once, in order", () => {
    for (const [year, days] of years) {
      expect(days[0]?.date).toBe(`${year}-01-01`);
      expect(days.at(-1)?.date).toBe(`${year}-12-31`);
      days.forEach((d, i) => {
        if (i > 0) expect(d.date).toBe(addDays((days[i - 1] as LiturgicalDay).date, 1));
      });
    }
  });

  test("exactly one primary per day, and it is one of the candidates", () => {
    for (const day of allDays()) {
      const primaries = day.celebrations.filter(
        (c) => c.status === "celebrated" || c.status === "transferred-in",
      );
      expect(primaries).toHaveLength(1);
      expect(day.celebrations).toContain(day.primary);
      expect(day.primary).toBe(primaries[0] as typeof day.primary);
      expect(day.primary.level).toBeLessThanOrEqual(13);
      expect(day.primary.status === "celebrated" || day.primary.status === "transferred-in").toBe(
        true,
      );
    }
  });

  test("an optional memorial is never the primary", () => {
    for (const day of allDays()) {
      expect(day.primary.level).not.toBe(12);
    }
  });

  test("nothing disappears without a status", () => {
    for (const day of allDays()) {
      for (const c of day.celebrations) {
        expect(STATUSES).toContain(c.status);
        if (c.status === "transferred-out") expect(c.movedTo).toBeDefined();
        if (c.status === "transferred-in") expect(c.movedFrom).toBeDefined();
      }
    }
    // Every active entry shows up as a candidate in its year.
    for (const [, days] of years) {
      const ids = new Set(days.flatMap((d) => d.celebrations.map((c) => c.id)));
      for (const entry of calendar.entries) expect(ids.has(entry.id)).toBe(true);
    }
  });

  test("Sundays of Advent, Lent and Easter and the Triduum are never displaced", () => {
    for (const day of allDays()) {
      if (day.season === "triduum") {
        expect(day.primary.level).toBe(1);
        expect(day.primary.rank).toBe("triduum");
      } else if (
        day.weekday === 0 &&
        (day.season === "advent" || day.season === "lent" || day.season === "easter")
      ) {
        expect(day.primary.level).toBe(2);
        expect(day.primary.status).toBe("celebrated");
        expect(day.celebrations.some((c) => c.status === "transferred-in")).toBe(false);
      }
    }
  });

  test("every solemnity of the calendar is celebrated exactly once per year", () => {
    for (const [, days] of years) {
      for (const id of solemnityIds) {
        const kept = days
          .flatMap((d) => d.celebrations)
          .filter(
            (c) => c.id === id && (c.status === "celebrated" || c.status === "transferred-in"),
          );
        expect(kept).toHaveLength(1);
      }
    }
  });

  test("transferred solemnities land on free days, and each move is recorded on both days", () => {
    const byDate = new Map<IsoDate, LiturgicalDay>();
    for (const day of allDays()) byDate.set(day.date, day);

    let moves = 0;
    let backward = 0;
    for (const day of allDays()) {
      for (const c of day.celebrations) {
        if (c.status === "transferred-in") {
          moves++;
          const others = day.celebrations.filter((o) => o !== c);
          // No other day of levels 1-8 is on the target (n. 60).
          expect(others.every((o) => o.level >= 9)).toBe(true);
          const origin = byDate.get(c.movedFrom as IsoDate);
          const out = origin?.celebrations.find((o) => o.id === c.id);
          expect(out).toMatchObject({ status: "transferred-out", movedTo: day.date });
          // R21 moves backward, R3 and R22 forward: the target only has to differ from the origin.
          expect(c.movedFrom).not.toBe(day.date);
          if ((c.movedFrom as IsoDate) > day.date) backward++;
        }
      }
    }
    // The synthetic calendar is built so that moves do happen.
    expect(moves).toBeGreaterThan(50);
    expect(backward).toBeGreaterThan(0);
    expect(backward).toBeLessThan(moves);
  });

  test("candidates are ordered by Table level", () => {
    for (const day of allDays()) {
      const levels = day.celebrations.map((c) => c.level);
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
    }
  });

  test("a day carries the M1 liturgical time unchanged", () => {
    for (const day of allDays()) {
      const { celebrations, primary, color, alternativeColors, ...time } = day;
      void celebrations;
      void primary;
      void color;
      void alternativeColors;
      expect(time).toEqual(getLiturgicalTime(day.date));
    }
  });

  test("the day color is the color of the primary", () => {
    for (const day of allDays()) {
      expect(day.color).toBe(day.primary.color);
      expect(day.alternativeColors).toBe(day.primary.alternativeColors);
    }
  });

  test("generateDay agrees with generateYear", () => {
    for (const year of [2000, 2008, 2016, 2024, 2026, 2100]) {
      const days = years.get(year) as LiturgicalDay[];
      for (const i of [0, 59, 100, 200, 300, days.length - 1]) {
        const expected = days[i] as LiturgicalDay;
        expect(generateDay(expected.date, { calendar })).toEqual(expected);
      }
    }
  });

  test("generation is deterministic", () => {
    expect(generateYear(2026, { calendar })).toEqual(years.get(2026) as LiturgicalDay[]);
  });

  test("results do not depend on the process time zone", () => {
    // `bun run test:tz` also runs the whole suite under two TZ values. Here the zone is switched
    // at run time, so a local `Date` leaking into the engine would change the output.
    const previous = process.env.TZ;
    try {
      for (const tz of ["Pacific/Kiritimati", "America/Los_Angeles", "UTC"]) {
        process.env.TZ = tz;
        for (const year of [2008, 2016, 2024, 2026]) {
          expect(generateYear(year, { calendar })).toEqual(years.get(year) as LiturgicalDay[]);
        }
      }
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
});
