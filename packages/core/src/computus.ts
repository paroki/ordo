import { type IsoDate, isoDate } from "./date";

/** Tahun Gregorian pertama (reformasi 1582, kalender mulai dipakai Oktober 1582). */
export const FIRST_GREGORIAN_YEAR = 1583;

/**
 * Tanggal Minggu Paskah (kalender Gregorian) untuk `year`.
 *
 * Algoritma anonim Gregorian (Meeus/Jones/Butcher). Semua hari bergerak dalam
 * tahun liturgi diturunkan dari hasil fungsi ini lewat offset hari.
 *
 * @throws {RangeError} bila `year` bukan bilangan bulat >= 1583.
 */
export function easter(year: number): IsoDate {
  if (!Number.isInteger(year) || year < FIRST_GREGORIAN_YEAR) {
    throw new RangeError(
      `Tahun harus bilangan bulat >= ${FIRST_GREGORIAN_YEAR} (kalender Gregorian), diterima: ${year}`,
    );
  }

  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return isoDate(year, month, day);
}
