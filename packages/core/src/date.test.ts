import { describe, expect, test } from "bun:test";
import { addDays, dayOfWeek, diffDays, isoDate } from "./date";

describe("date helpers (date-only, UTC)", () => {
  test("addDays melewati batas bulan dan tahun", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2024-02-28", 2)).toBe("2024-03-01"); // tahun kabisat
    expect(addDays("2026-04-05", -46)).toBe("2026-02-18"); // Rabu Abu 2026
  });

  test("addDays dengan offset hari bergerak dari Paskah 2026", () => {
    expect(addDays("2026-04-05", 49)).toBe("2026-05-24"); // Pentakosta
    expect(addDays("2026-04-05", -2)).toBe("2026-04-03"); // Jumat Agung
  });

  test("diffDays", () => {
    expect(diffDays("2026-04-05", "2026-02-18")).toBe(46);
    expect(diffDays("2026-02-18", "2026-04-05")).toBe(-46);
    expect(diffDays("2026-11-29", "2026-11-29")).toBe(0);
  });

  test("dayOfWeek: 0 = Minggu", () => {
    expect(dayOfWeek("2026-04-05")).toBe(0); // Paskah 2026
    expect(dayOfWeek("2026-11-29")).toBe(0); // Adven I 2026
    expect(dayOfWeek("2026-12-25")).toBe(5); // Natal 2026 hari Jumat
    expect(dayOfWeek("1970-01-01")).toBe(4);
  });

  test("isoDate menormalkan tanggal dan menjaga padding", () => {
    expect(isoDate(2026, 4, 5)).toBe("2026-04-05");
    expect(isoDate(2026, 13, 1)).toBe("2027-01-01");
  });
});
