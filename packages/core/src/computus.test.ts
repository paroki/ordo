import { describe, expect, test } from "bun:test";
import { easter, FIRST_GREGORIAN_YEAR } from "./computus";
import { dayOfWeek } from "./date";

// Widely published dates of Easter (Gregorian calendar).
const KNOWN_EASTERS: Record<number, string> = {
  2000: "2000-04-23",
  2001: "2001-04-15",
  2002: "2002-03-31",
  2003: "2003-04-20",
  2004: "2004-04-11",
  2005: "2005-03-27",
  2006: "2006-04-16",
  2007: "2007-04-08",
  2008: "2008-03-23",
  2009: "2009-04-12",
  2010: "2010-04-04",
  2011: "2011-04-24",
  2012: "2012-04-08",
  2013: "2013-03-31",
  2014: "2014-04-20",
  2015: "2015-04-05",
  2016: "2016-03-27",
  2017: "2017-04-16",
  2018: "2018-04-01",
  2019: "2019-04-21",
  2020: "2020-04-12",
  2021: "2021-04-04",
  2022: "2022-04-17",
  2023: "2023-04-09",
  2024: "2024-03-31",
  2025: "2025-04-20",
  2026: "2026-04-05",
  2027: "2027-03-28",
  2028: "2028-04-16",
  2029: "2029-04-01",
  2030: "2030-04-21",
};

describe("easter()", () => {
  test.each(Object.entries(KNOWN_EASTERS))("year %s -> %s", (year, expected) => {
    expect(easter(Number(year))).toBe(expected as ReturnType<typeof easter>);
  });

  test("earliest and latest possible dates", () => {
    expect(easter(1818)).toBe("1818-03-22");
    expect(easter(2285)).toBe("2285-03-22");
    expect(easter(1943)).toBe("1943-04-25");
    expect(easter(2038)).toBe("2038-04-25");
  });

  test("property: always a Sunday between 22 March and 25 April (1583-4099)", () => {
    for (let year = FIRST_GREGORIAN_YEAR; year <= 4099; year++) {
      const date = easter(year);
      expect(dayOfWeek(date)).toBe(0);
      expect(date >= `${year}-03-22` && date <= `${year}-04-25`).toBe(true);
    }
  });

  test("rejects years before the Gregorian calendar and non-integers", () => {
    expect(() => easter(1582)).toThrow(RangeError);
    expect(() => easter(2026.5)).toThrow(RangeError);
    expect(() => easter(Number.NaN)).toThrow(RangeError);
  });
});
