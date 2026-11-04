import { describe, expect, test } from "bun:test";
import { adventSunday, getAnchors } from "./anchors";
import { FIRST_GREGORIAN_YEAR } from "./computus";
import { dayOfWeek } from "./date";

describe("getAnchors() spot checks", () => {
  test("2026 with General Roman Calendar defaults", () => {
    const a = getAnchors(2026);
    expect(a.easter).toBe("2026-04-05");
    expect(a.ashWednesday).toBe("2026-02-18");
    expect(a.palmSunday).toBe("2026-03-29");
    expect(a.holyThursday).toBe("2026-04-02");
    expect(a.goodFriday).toBe("2026-04-03");
    expect(a.holySaturday).toBe("2026-04-04");
    expect(a.ascension).toBe("2026-05-14");
    expect(a.pentecost).toBe("2026-05-24");
    expect(a.trinitySunday).toBe("2026-05-31");
    expect(a.corpusChristi).toBe("2026-06-04");
    expect(a.sacredHeart).toBe("2026-06-12");
    expect(a.immaculateHeart).toBe("2026-06-13");
    expect(a.epiphany).toBe("2026-01-06");
    expect(a.baptismOfTheLord).toBe("2026-01-11");
    expect(a.adventI).toBe("2026-11-29");
    expect(a.christmas).toBe("2026-12-25");
    expect(a.holyFamily).toBe("2026-12-27");
    expect(a.christTheKing).toBe("2026-11-22");
  });

  test("2026 with Epiphany, Ascension and Corpus Christi moved to Sunday", () => {
    const a = getAnchors(2026, {
      epiphany: "sunday",
      ascension: "sunday",
      corpusChristi: "sunday",
    });
    expect(a.epiphany).toBe("2026-01-04");
    expect(a.baptismOfTheLord).toBe("2026-01-11");
    expect(a.ascension).toBe("2026-05-17");
    expect(a.corpusChristi).toBe("2026-06-07");
    // Sacred Heart does not depend on the Corpus Christi setting.
    expect(a.sacredHeart).toBe("2026-06-12");
  });

  test("Baptism of the Lord on a Monday when Epiphany (Sunday) falls on 7 or 8 January", () => {
    const y2018 = getAnchors(2018, { epiphany: "sunday" });
    expect(y2018.epiphany).toBe("2018-01-07");
    expect(y2018.baptismOfTheLord).toBe("2018-01-08");

    const y2023 = getAnchors(2023, { epiphany: "sunday" });
    expect(y2023.epiphany).toBe("2023-01-08");
    expect(y2023.baptismOfTheLord).toBe("2023-01-09");
  });

  test("Baptism of the Lord is the Sunday after 6 January with Epiphany on 6 January", () => {
    expect(getAnchors(2018).baptismOfTheLord).toBe("2018-01-07"); // 6 Jan is a Saturday
    expect(getAnchors(2025).baptismOfTheLord).toBe("2025-01-12"); // 6 Jan is a Monday
    expect(getAnchors(2021).baptismOfTheLord).toBe("2021-01-10"); // 6 Jan is a Wednesday
  });

  test("Holy Family: Sunday in the octave of Christmas, 30 December when Christmas is a Sunday", () => {
    expect(getAnchors(2026).holyFamily).toBe("2026-12-27");
    expect(getAnchors(2025).holyFamily).toBe("2025-12-28");
    expect(getAnchors(2022).holyFamily).toBe("2022-12-30"); // Christmas 2022 is a Sunday
  });

  test("First Sunday of Advent", () => {
    expect(adventSunday(2022)).toBe("2022-11-27"); // Christmas on a Sunday
    expect(adventSunday(2024)).toBe("2024-12-01");
    expect(adventSunday(2025)).toBe("2025-11-30");
    expect(adventSunday(2026)).toBe("2026-11-29");
    expect(adventSunday(2027)).toBe("2027-11-28");
  });
});

describe("getAnchors() properties", () => {
  test("weekdays and calendar windows hold for every year 1583-4099, with both setting sets", () => {
    for (let year = FIRST_GREGORIAN_YEAR; year <= 4099; year++) {
      const defaults = getAnchors(year);
      const sundays = getAnchors(year, {
        epiphany: "sunday",
        ascension: "sunday",
        corpusChristi: "sunday",
      });

      for (const a of [defaults, sundays]) {
        expect(dayOfWeek(a.easter)).toBe(0);
        expect(dayOfWeek(a.ashWednesday)).toBe(3);
        expect(dayOfWeek(a.palmSunday)).toBe(0);
        expect(dayOfWeek(a.holyThursday)).toBe(4);
        expect(dayOfWeek(a.goodFriday)).toBe(5);
        expect(dayOfWeek(a.holySaturday)).toBe(6);
        expect(dayOfWeek(a.pentecost)).toBe(0);
        expect(dayOfWeek(a.trinitySunday)).toBe(0);
        expect(dayOfWeek(a.sacredHeart)).toBe(5);
        expect(dayOfWeek(a.immaculateHeart)).toBe(6);
        expect(dayOfWeek(a.adventI)).toBe(0);
        expect(a.adventI >= `${year}-11-27` && a.adventI <= `${year}-12-03`).toBe(true);
        expect(dayOfWeek(a.christTheKing)).toBe(0);
        expect(a.christTheKing >= `${year}-11-20` && a.christTheKing <= `${year}-11-26`).toBe(true);
        expect([0, 1]).toContain(dayOfWeek(a.baptismOfTheLord));
        if (dayOfWeek(a.christmas) === 0) {
          expect(a.holyFamily).toBe(`${year}-12-30`);
        } else {
          expect(dayOfWeek(a.holyFamily)).toBe(0);
          expect(a.holyFamily >= `${year}-12-26` && a.holyFamily <= `${year}-12-31`).toBe(true);
        }
      }

      expect(dayOfWeek(defaults.ascension)).toBe(4);
      expect(dayOfWeek(defaults.corpusChristi)).toBe(4);
      expect(dayOfWeek(sundays.ascension)).toBe(0);
      expect(dayOfWeek(sundays.corpusChristi)).toBe(0);
      expect(dayOfWeek(sundays.epiphany)).toBe(0);
      expect(sundays.epiphany >= `${year}-01-02` && sundays.epiphany <= `${year}-01-08`).toBe(true);
    }
  });
});
