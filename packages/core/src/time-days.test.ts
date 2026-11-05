import { describe, expect, test } from "bun:test";
import type { IsoDate } from "./date";
import { dayOf } from "./test-calendar";

// Levels follow the Table of Liturgical Days (Universal Norms n. 59, ADR-0003).
function primary(date: IsoDate) {
  return dayOf(date, []).primary;
}

describe("days of the Proper of Time", () => {
  test("Paschal Triduum days are level 1 (n. 59)", () => {
    // Easter 2025 is 20 April.
    for (const [date, id] of [
      ["2025-04-17", "holy-thursday"],
      ["2025-04-18", "good-friday"],
      ["2025-04-19", "holy-saturday"],
    ] as const) {
      expect(primary(date)).toMatchObject({ id, level: 1, rank: "triduum" });
    }
  });

  test("Easter Sunday, Palm Sunday, Ascension and Pentecost are level 2 (n. 59)", () => {
    expect(primary("2025-04-20")).toMatchObject({ id: "easter-sunday", level: 2 });
    expect(primary("2025-04-13")).toMatchObject({ id: "palm-sunday", level: 2 });
    expect(primary("2025-05-29")).toMatchObject({ id: "ascension", level: 2 });
    expect(primary("2025-06-08")).toMatchObject({ id: "pentecost", level: 2 });
  });

  test("Ash Wednesday and Monday to Wednesday of Holy Week are level 2 (n. 59)", () => {
    expect(primary("2025-03-05")).toMatchObject({ id: "ash-wednesday", level: 2 });
    expect(primary("2025-04-14")).toMatchObject({ id: "holy-monday", level: 2 });
    expect(primary("2025-04-15")).toMatchObject({ id: "holy-tuesday", level: 2 });
    expect(primary("2025-04-16")).toMatchObject({ id: "holy-wednesday", level: 2 });
  });

  test("the days of the Easter octave are level 2 (n. 59), the Sunday after is too", () => {
    expect(primary("2025-04-21")).toMatchObject({ id: "easter-octave-monday", level: 2 });
    expect(primary("2025-04-26")).toMatchObject({ id: "easter-octave-saturday", level: 2 });
    expect(primary("2025-04-27")).toMatchObject({ id: "easter-w2-sunday", level: 2 });
    // After the octave, Easter weekdays are level 13.
    expect(primary("2025-04-28")).toMatchObject({ id: "easter-w2-monday", level: 13 });
  });

  test("Sundays of Advent, Lent and Easter are level 2; of Ordinary Time and Christmas, 6", () => {
    expect(primary("2025-11-30")).toMatchObject({ id: "advent-w1-sunday", level: 2 });
    expect(primary("2025-03-09")).toMatchObject({ id: "lent-w1-sunday", level: 2 });
    expect(primary("2025-05-04")).toMatchObject({ id: "easter-w3-sunday", level: 2 });
    expect(primary("2025-09-14")).toMatchObject({ id: "ordinary-time-w24-sunday", level: 6 });
    expect(primary("2025-12-28")).toMatchObject({ id: "christmas-sunday-1", level: 6 });
    expect(primary("2026-01-04")).toMatchObject({ id: "christmas-sunday-2", level: 6 });
  });

  test("Advent weekdays are level 9 from 17 December and level 13 before (n. 59)", () => {
    expect(primary("2025-12-16")).toMatchObject({ id: "advent-w3-tuesday", level: 13 });
    expect(primary("2025-12-17")).toMatchObject({ id: "advent-dec-17", level: 9 });
    expect(primary("2025-12-24")).toMatchObject({ id: "advent-dec-24", level: 9 });
  });

  test("Christmas octave days are level 9, later Christmas weekdays level 13 (n. 59)", () => {
    expect(primary("2025-12-29")).toMatchObject({ id: "christmas-dec-29", level: 9 });
    expect(primary("2026-01-01")).toMatchObject({ id: "christmas-jan-01", level: 9 });
    expect(primary("2026-01-02")).toMatchObject({ id: "christmas-jan-02", level: 13 });
  });

  test("Lent weekdays are level 9, Ordinary Time weekdays level 13 (n. 59)", () => {
    expect(primary("2025-03-06")).toMatchObject({ id: "lent-w0-thursday", level: 9 });
    expect(primary("2025-03-12")).toMatchObject({ id: "lent-w1-wednesday", level: 9 });
    expect(primary("2025-09-10")).toMatchObject({ id: "ordinary-time-w23-wednesday", level: 13 });
  });
});
