import { describe, expect, test } from "bun:test";
import { sundayCycle, weekdayCycle } from "./cycles";

describe("sundayCycle()", () => {
  test("the cycle changes on the First Sunday of Advent", () => {
    expect(sundayCycle("2024-11-30")).toBe("B");
    expect(sundayCycle("2024-12-01")).toBe("C");
    expect(sundayCycle("2025-11-29")).toBe("C");
    expect(sundayCycle("2025-11-30")).toBe("A");
    expect(sundayCycle("2026-11-28")).toBe("A");
    expect(sundayCycle("2026-11-29")).toBe("B");
    expect(sundayCycle("2027-11-27")).toBe("B");
    expect(sundayCycle("2027-11-28")).toBe("C");
  });

  test("dates early in the civil year belong to the cycle that started the previous Advent", () => {
    expect(sundayCycle("2026-01-04")).toBe("A");
    expect(sundayCycle("2026-04-05")).toBe("A"); // Easter 2026
    expect(sundayCycle("2027-04-04")).toBe("B");
  });

  test("the three cycles repeat in order A, B, C", () => {
    const order = [2022, 2023, 2024, 2025, 2026, 2027].map((year) => sundayCycle(`${year}-12-24`));
    // Advent of 2022 starts Year A (2023 % 3 === 1).
    expect(order).toEqual(["A", "B", "C", "A", "B", "C"]);
  });
});

describe("weekdayCycle()", () => {
  test("Year I in odd years, Year II in even years", () => {
    expect(weekdayCycle("2025-06-09")).toBe("I");
    expect(weekdayCycle("2026-06-09")).toBe("II");
    expect(weekdayCycle("2027-01-01")).toBe("I");
  });
});
