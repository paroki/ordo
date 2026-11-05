import { describe, expect, test } from "bun:test";
import { getAnchors } from "./anchors";
import type { CalendarEntry, TransferRule } from "./calendar";
import { addDays, dayOfWeek, type IsoDate } from "./date";
import { generateYear } from "./generate";
import { anchored, dayOf, fixed, makeCalendar, statusOf } from "./test-calendar";

// Paragraph numbers refer to the Universal Norms on the Liturgical Year and the General Roman
// Calendar as printed in the Missale Romanum 2002 (S1 of ADR-0003). R-numbers are the rules of
// ADR-0003. Calendars here are synthetic: the ids and dates exercise a rule, they state no fact.

const JOSEPH_RULE: TransferRule = {
  from: { anchor: "palmSunday" },
  to: { anchor: "easter", offset: 7 },
  target: { anchor: "palmSunday", offset: -1 },
};
const ANNUNCIATION_RULE: TransferRule = {
  from: { anchor: "palmSunday" },
  to: { anchor: "easter", offset: 7 },
  target: { anchor: "easter", offset: 8 },
};

function sunday(date: IsoDate): IsoDate {
  expect(dayOfWeek(date)).toBe(0);
  return date;
}

describe("R1, R2: the Table decides which celebration is kept (nn. 59, 60)", () => {
  test("a feast outranks a weekday of Ordinary Time", () => {
    const day = dayOf("2025-09-10", [fixed("test-feast", 9, 10, "feast")]);
    expect(day.primary).toMatchObject({ id: "test-feast", level: 7, status: "celebrated" });
    expect(statusOf(day, "ordinary-time-w23-wednesday")).toBe("suppressed");
  });

  test("a solemnity outranks a Sunday of Ordinary Time (level 3 over 6, also All Souls)", () => {
    const date = sunday("2025-11-02");
    const day = dayOf(date, [fixed("test-solemnity", 11, 2, "solemnity")]);
    expect(day.primary).toMatchObject({ id: "test-solemnity", level: 3 });
    expect(statusOf(day, "ordinary-time-w31-sunday")).toBe("suppressed");
  });

  test("R6 (n. 6): a feast of the Lord replaces a Sunday of Ordinary Time, another feast does not", () => {
    const lord = dayOf(sunday("2025-09-14"), [fixed("test-lord", 9, 14, "feast", { lord: true })]);
    expect(lord.primary).toMatchObject({ id: "test-lord", level: 5 });

    const other = dayOf(sunday("2025-09-21"), [fixed("test-saint", 9, 21, "feast")]);
    expect(other.primary.id).toBe("ordinary-time-w25-sunday");
    expect(statusOf(other, "test-saint")).toBe("suppressed");
  });

  test("a level 2 solemnity outranks a Sunday of the Christmas season", () => {
    const date = sunday("2025-12-28");
    const day = dayOf(date, [fixed("test-nativity-like", 12, 28, "solemnity", { level: 2 })]);
    expect(day.primary).toMatchObject({ id: "test-nativity-like", level: 2 });
  });
});

describe("R5 (n. 5): Sundays of Advent, Lent and Easter", () => {
  test("they rank above feasts of the Lord, which are omitted for the year", () => {
    const date = sunday("2025-11-30");
    const day = dayOf(date, [fixed("test-lord", 11, 30, "feast", { lord: true })]);
    expect(day.primary.id).toBe("advent-w1-sunday");
    expect(statusOf(day, "test-lord")).toBe("suppressed");
  });

  test("a solemnity on a Sunday of Advent moves to the Monday", () => {
    const date = sunday("2024-12-08");
    const entries = [fixed("test-solemnity", 12, 8, "solemnity")];
    const sundayDay = dayOf(date, entries);
    expect(sundayDay.primary.id).toBe("advent-w2-sunday");
    expect(sundayDay.celebrations.find((c) => c.id === "test-solemnity")).toMatchObject({
      status: "transferred-out",
      movedTo: "2024-12-09",
    });
    expect(dayOf("2024-12-09", entries).primary).toMatchObject({
      id: "test-solemnity",
      status: "transferred-in",
      movedFrom: "2024-12-08",
    });
  });

  test("a solemnity on a Sunday of Lent moves to the Monday", () => {
    const a = getAnchors(2025);
    const sundayOfLent = sunday(addDays(a.ashWednesday, 4));
    const entries = [anchored("test-solemnity", "ashWednesday", 4, "solemnity")];
    expect(dayOf(sundayOfLent, entries).primary.id).toBe("lent-w1-sunday");
    expect(dayOf(addDays(sundayOfLent, 1), entries).primary).toMatchObject({
      id: "test-solemnity",
      status: "transferred-in",
    });
  });

  test("a solemnity on a Sunday of Easter moves to the Monday", () => {
    const a = getAnchors(2025);
    const entries = [anchored("test-solemnity", "easter", 14, "solemnity")];
    expect(dayOf(addDays(a.easter, 14), entries).primary.id).toBe("easter-w3-sunday");
    expect(dayOf(addDays(a.easter, 15), entries).primary.status).toBe("transferred-in");
  });
});

describe("R3 (n. 60): an impeded solemnity moves to the nearest free day", () => {
  test("from Holy Week to the first day after the Easter octave's Sunday", () => {
    const a = getAnchors(2025);
    const entries = [anchored("test-solemnity", "palmSunday", 2, "solemnity")];
    const moved = dayOf(addDays(a.easter, 8), entries);
    expect(moved.primary).toMatchObject({ id: "test-solemnity", movedFrom: "2025-04-15" });
  });

  test("from Good Friday, the Triduum and the octave are skipped", () => {
    const a = getAnchors(2025);
    const entries = [anchored("test-solemnity", "goodFriday", 0, "solemnity")];
    const origin = dayOf(a.goodFriday, entries);
    expect(origin.primary.id).toBe("good-friday");
    expect(origin.celebrations.find((c) => c.id === "test-solemnity")?.movedTo).toBe(
      addDays(a.easter, 8),
    );
  });

  test("an impeded feast is omitted, not moved", () => {
    const a = getAnchors(2025);
    const entries = [anchored("test-feast", "palmSunday", 2, "feast")];
    const origin = dayOf(addDays(a.palmSunday, 2), entries);
    expect(statusOf(origin, "test-feast")).toBe("suppressed");
    const all = generateYear(2025, { calendar: makeCalendar(entries) });
    expect(all.filter((d) => d.primary.id === "test-feast")).toHaveLength(0);
  });

  test("several impeded solemnities go in date order to successive free days", () => {
    const a = getAnchors(2025);
    const entries = [
      anchored("test-b", "palmSunday", 3, "solemnity"),
      anchored("test-a", "palmSunday", 2, "solemnity"),
    ];
    expect(dayOf(addDays(a.easter, 8), entries).primary.id).toBe("test-a");
    expect(dayOf(addDays(a.easter, 9), entries).primary.id).toBe("test-b");
  });

  test("a day that has a solemnity of its own is not free", () => {
    const a = getAnchors(2025);
    const entries = [
      anchored("test-impeded", "palmSunday", 3, "solemnity"),
      anchored("test-resident", "easter", 8, "solemnity"),
    ];
    expect(dayOf(addDays(a.easter, 8), entries).primary.id).toBe("test-resident");
    expect(dayOf(addDays(a.easter, 9), entries).primary).toMatchObject({
      id: "test-impeded",
      status: "transferred-in",
    });
  });

  test("a Lent weekday is free: the solemnity takes it from the weekday", () => {
    const a = getAnchors(2025);
    const date = addDays(a.ashWednesday, 8); // Thursday, level 9
    const entries = [anchored("test-solemnity", "easter", 14, "solemnity")];
    expect(dayOf(date, entries).primary.id).toBe("lent-w1-thursday");
    // A solemnity that lands on a Lent weekday would win over it (level 3 over 9).
    const own = dayOf(date, [anchored("test-own", "ashWednesday", 8, "solemnity")]);
    expect(own.primary.id).toBe("test-own");
    expect(statusOf(own, "lent-w1-thursday")).toBe("suppressed");
  });

  test("two solemnities of the same level on one day: one is moved, deterministically", () => {
    // UNVERIFIED tie-break (ADR-0003, Q6): movable entries first, then the id.
    const a = getAnchors(2025);
    const date = a.sacredHeart;
    const month = Number(date.slice(5, 7));
    const dom = Number(date.slice(8));
    const entries = [
      fixed("test-fixed", month, dom, "solemnity"),
      anchored("test-movable", "sacredHeart", 0, "solemnity"),
    ];
    expect(dayOf(date, entries).primary.id).toBe("test-movable");
    expect(dayOf(addDays(date, 1), entries).primary).toMatchObject({
      id: "test-fixed",
      movedFrom: date,
    });
  });

  test("the transfer never leaves the civil year: it throws instead", () => {
    // 24 December 2023 is a Sunday of Advent; every later day of the year is level 2.
    const entries = [
      fixed("test-impeded", 12, 24, "solemnity"),
      ...[25, 26, 27, 28, 29, 30, 31].map((d) =>
        fixed(`test-block-${d}`, 12, d, "solemnity", { level: 2 }),
      ),
    ];
    expect(() => generateYear(2023, { calendar: makeCalendar(entries) })).toThrow(/no free day/);
  });
});

describe("R4, R21, R22: dated exceptions of the transfer search (data, UNVERIFIED R21 R22)", () => {
  const annunciation: CalendarEntry = fixed("test-annunciation", 3, 25, "solemnity", {
    transfers: [ANNUNCIATION_RULE],
  });
  const joseph: CalendarEntry = fixed("test-joseph", 3, 19, "solemnity", {
    transfers: [JOSEPH_RULE],
  });

  test("R4 (n. 60): the Annunciation in Holy Week moves to the Monday after Easter II", () => {
    // 25 March 2016 is Good Friday.
    const a = getAnchors(2016);
    expect(a.goodFriday).toBe("2016-03-25");
    const moved = dayOf(addDays(a.easter, 8), [annunciation]);
    expect(moved.primary).toMatchObject({ id: "test-annunciation", movedFrom: "2016-03-25" });
  });

  test("R4 also follows from the generic search when the entry has no exception", () => {
    const a = getAnchors(2016);
    const moved = dayOf(addDays(a.easter, 8), [fixed("test-annunciation", 3, 25, "solemnity")]);
    expect(moved.primary.id).toBe("test-annunciation");
  });

  test("R21 (2008): the solemnity of 19 March in Holy Week moves back to the Saturday before Palm Sunday", () => {
    const a = getAnchors(2008);
    expect(a.easter).toBe("2008-03-23");
    const day = dayOf("2008-03-15", [joseph]);
    expect(day.primary).toMatchObject({ id: "test-joseph", movedFrom: "2008-03-19" });
  });

  test("R22 (2008): the solemnity of 25 March in the octave moves to the Monday after Easter II", () => {
    const day = dayOf("2008-03-31", [annunciation]);
    expect(day.primary).toMatchObject({ id: "test-annunciation", movedFrom: "2008-03-25" });
  });

  test("R21 on Palm Sunday itself (n. 56 f): Saturday before", () => {
    // Palm Sunday 2012 is 1 April; use an anchored entry on Palm Sunday.
    const entry = anchored("test-joseph", "palmSunday", 0, "solemnity", {
      transfers: [JOSEPH_RULE],
    });
    const a = getAnchors(2012);
    expect(dayOf(addDays(a.palmSunday, -1), [entry]).primary.id).toBe("test-joseph");
  });

  test("outside the exception range the generic search applies", () => {
    // 19 March 2025 is a Wednesday of Lent: not impeded, stays on its date.
    const day = dayOf("2025-03-19", [joseph]);
    expect(day.primary).toMatchObject({ id: "test-joseph", status: "celebrated" });
  });
});

describe("R10, R11, R12, R16: memorials", () => {
  test("R10 (n. 14): an obligatory memorial in Lent is only optional", () => {
    const day = dayOf("2025-03-12", [fixed("test-memorial", 3, 12, "memorial")]);
    expect(day.primary.id).toBe("lent-w1-wednesday");
    expect(day.celebrations.find((c) => c.id === "test-memorial")).toMatchObject({
      status: "optional",
      level: 12,
    });
  });

  test("an obligatory memorial combines with a weekday of Ordinary Time (n. 16)", () => {
    const day = dayOf("2025-09-10", [fixed("test-memorial", 9, 10, "memorial")]);
    expect(day.primary).toMatchObject({ id: "test-memorial", level: 10 });
    expect(statusOf(day, "ordinary-time-w23-wednesday")).toBe("suppressed");
  });

  test("an optional memorial never becomes the primary", () => {
    const day = dayOf("2025-09-10", [fixed("test-optional", 9, 10, "optional-memorial")]);
    expect(day.primary.id).toBe("ordinary-time-w23-wednesday");
    expect(statusOf(day, "test-optional")).toBe("optional");
  });

  test("n. 14: two optional memorials on one day are both listed, none is the primary", () => {
    const day = dayOf("2025-09-10", [
      fixed("test-optional-1", 9, 10, "optional-memorial"),
      fixed("test-optional-2", 9, 10, "optional-memorial"),
    ]);
    expect(statusOf(day, "test-optional-1")).toBe("optional");
    expect(statusOf(day, "test-optional-2")).toBe("optional");
    expect(day.primary.id).toBe("ordinary-time-w23-wednesday");
  });

  test("an optional memorial is suppressed by an obligatory memorial of the same day", () => {
    const day = dayOf("2025-09-10", [
      fixed("test-memorial", 9, 10, "memorial"),
      fixed("test-optional", 9, 10, "optional-memorial"),
    ]);
    expect(statusOf(day, "test-optional")).toBe("suppressed");
  });

  test("R16: optional memorials stay optional in Lent, 17-24 December and the Christmas octave", () => {
    for (const [date, month, dom] of [
      ["2025-03-12", 3, 12],
      ["2025-12-18", 12, 18],
      ["2025-12-29", 12, 29],
    ] as const) {
      const day = dayOf(date, [fixed("test-optional", month, dom, "optional-memorial")]);
      expect(statusOf(day, "test-optional")).toBe("optional");
      expect(day.primary.level).toBe(9);
    }
  });

  test("R12 (n. 16): 17-24 December and the octave rank above obligatory memorials", () => {
    for (const [date, month, dom] of [
      ["2025-12-18", 12, 18],
      ["2025-12-29", 12, 29],
    ] as const) {
      const day = dayOf(date, [fixed("test-memorial", month, dom, "memorial")]);
      expect(statusOf(day, "test-memorial")).toBe("suppressed");
      expect(day.primary.level).toBe(9);
    }
  });

  test("R12: before 17 December Advent weekdays combine with memorials", () => {
    const day = dayOf("2025-12-10", [fixed("test-memorial", 12, 10, "memorial")]);
    expect(day.primary.id).toBe("test-memorial");
  });

  test("R12/R16: Ash Wednesday, Holy Week and the Easter octave admit no memorial", () => {
    const a = getAnchors(2025);
    for (const date of [a.ashWednesday, addDays(a.palmSunday, 1), addDays(a.easter, 2)]) {
      const month = Number(date.slice(5, 7));
      const dom = Number(date.slice(8));
      const day = dayOf(date, [
        fixed("test-memorial", month, dom, "memorial"),
        fixed("test-optional", month, dom, "optional-memorial"),
      ]);
      expect(day.primary.level).toBe(2);
      expect(statusOf(day, "test-memorial")).toBe("suppressed");
      expect(statusOf(day, "test-optional")).toBe("suppressed");
    }
  });

  test("R16: Easter-season weekdays after the octave admit the memorial in full", () => {
    const a = getAnchors(2025);
    const date = addDays(a.easter, 9);
    const month = Number(date.slice(5, 7));
    const dom = Number(date.slice(8));
    expect(dayOf(date, [fixed("test-memorial", month, dom, "memorial")]).primary.id).toBe(
      "test-memorial",
    );
  });

  test("R11 (n. 15): the Saturday memorial of Mary is optional on Saturdays of Ordinary Time", () => {
    const day = dayOf("2025-09-13", []);
    expect(day.primary.id).toBe("ordinary-time-w23-saturday");
    expect(day.celebrations.find((c) => c.id === "saturday-memorial-of-mary")).toMatchObject({
      status: "optional",
      level: 12,
      color: "white",
    });
  });

  test("R11: it is suppressed when an obligatory memorial is on the Saturday", () => {
    const day = dayOf("2025-09-13", [fixed("test-memorial", 9, 13, "memorial")]);
    expect(statusOf(day, "saturday-memorial-of-mary")).toBe("suppressed");
  });

  test("R11: it does not exist on Saturdays of Advent, Lent or Easter", () => {
    for (const date of ["2025-12-06", "2025-03-15", "2025-05-10"] as const) {
      expect(statusOf(dayOf(date, []), "saturday-memorial-of-mary")).toBeUndefined();
    }
  });

  test("R25: a movable memorial precedes a fixed one; both are listed (UNVERIFIED)", () => {
    const a = getAnchors(2026);
    expect(a.immaculateHeart).toBe("2026-06-13");
    const day = dayOf("2026-06-13", [
      fixed("test-fixed-memorial", 6, 13, "memorial"),
      anchored("test-movable-memorial", "immaculateHeart", 0, "memorial"),
    ]);
    expect(day.primary.id).toBe("test-movable-memorial");
    expect(statusOf(day, "test-fixed-memorial")).toBe("optional");
    expect(day.celebrations.map((c) => c.id).slice(0, 2)).toEqual([
      "test-movable-memorial",
      "test-fixed-memorial",
    ]);
  });
});

describe("validity ranges and entry placement (ADR-0003, 4a)", () => {
  test("an entry applies only inside its validity range", () => {
    const entry = fixed("test-feast", 9, 10, "feast", { validFrom: 2020, validUntil: 2024 });
    expect(statusOf(dayOf("2019-09-10", [entry]), "test-feast")).toBeUndefined();
    expect(statusOf(dayOf("2020-09-10", [entry]), "test-feast")).toBe("celebrated");
    expect(statusOf(dayOf("2024-09-10", [entry]), "test-feast")).toBe("celebrated");
    expect(statusOf(dayOf("2025-09-10", [entry]), "test-feast")).toBeUndefined();
  });

  test("the same id may appear twice with non-overlapping ranges", () => {
    const entries = [
      fixed("test-saint", 9, 10, "optional-memorial", { validUntil: 2019 }),
      fixed("test-saint", 9, 10, "memorial", { validFrom: 2020 }),
    ];
    expect(dayOf("2019-09-10", entries).primary.id).toBe("ordinary-time-w23-tuesday");
    expect(dayOf("2025-09-10", entries).primary.id).toBe("test-saint");
  });

  test("overlapping ranges for one id are an error", () => {
    const entries = [
      fixed("test-saint", 9, 10, "memorial"),
      fixed("test-saint", 9, 11, "memorial"),
    ];
    expect(() => dayOf("2025-09-10", entries)).toThrow(/duplicate active entry id/);
  });

  test("a date that does not exist in the year is an error", () => {
    expect(() => dayOf("2025-09-10", [fixed("test-leap", 2, 29, "feast")])).toThrow(
      /does not exist/,
    );
  });

  test("an anchor entry places the celebration at anchor plus offset", () => {
    const a = getAnchors(2026);
    const day = dayOf(addDays(a.pentecost, 7), [
      anchored("test-trinity", "pentecost", 7, "solemnity"),
    ]);
    expect(day.primary.id).toBe("test-trinity");
  });
});

describe("R17: color", () => {
  test("the color of a derived day comes from its season", () => {
    expect(dayOf("2025-09-10", []).color).toBe("green");
    expect(dayOf("2025-03-12", []).color).toBe("violet");
    expect(dayOf("2025-04-28", []).color).toBe("white");
  });

  test("a per-day override and its alternative colors are reported explicitly", () => {
    const day = dayOf("2025-12-14", []);
    expect(day.primary.id).toBe("advent-w3-sunday");
    expect(day.color).toBe("violet");
    expect(day.alternativeColors).toEqual(["rose"]);
  });

  test("an override can set the color of a day of the Triduum", () => {
    const calendar = makeCalendar([], {
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
        "holy-saturday": { color: "white" },
      },
    });
    const days = generateYear(2025, { calendar });
    expect(days.find((d) => d.date === "2025-04-19")?.color).toBe("white");
    expect(days.find((d) => d.date === "2025-04-18")?.color).toBe("red");
  });

  test("the color of an entry and its alternatives come from the entry", () => {
    const day = dayOf("2025-11-02", [
      fixed("test-solemnity", 11, 2, "solemnity", {
        color: "violet",
        alternativeColors: ["black"],
      }),
    ]);
    expect(day.color).toBe("violet");
    expect(day.alternativeColors).toEqual(["black"]);
  });

  test("a transferred solemnity keeps its own color on the new day", () => {
    const day = dayOf("2024-12-09", [
      fixed("test-solemnity", 12, 8, "solemnity", { color: "red" }),
    ]);
    expect(day.primary.status).toBe("transferred-in");
    expect(day.color).toBe("red");
  });

  test("a calendar without the Saturday memorial color is rejected", () => {
    const calendar = makeCalendar([], {
      seasons: {
        advent: "violet",
        christmas: "white",
        "ordinary-time": "green",
        lent: "violet",
        triduum: "red",
        easter: "white",
      },
    });
    expect(() => generateYear(2025, { calendar })).toThrow(/saturday-memorial-of-mary/);
  });
});
