/**
 * Tanggal sipil (tanpa jam, tanpa zona waktu) dalam format ISO "YYYY-MM-DD".
 *
 * Semua perhitungan kalender liturgi memakai tipe ini, bukan `Date` lokal,
 * supaya hasilnya tidak bergantung pada timezone mesin.
 */
export type IsoDate = `${number}-${number}-${number}`;

const MS_PER_DAY = 86_400_000;

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Membuat IsoDate dari komponen. Bulan 1-12. */
export function isoDate(year: number, month: number, day: number): IsoDate {
  const t = Date.UTC(year, month - 1, day);
  const d = new Date(t);
  // Date.UTC memetakan tahun 0-99 ke 1900-1999; setUTCFullYear menjaga tahun apa adanya.
  d.setUTCFullYear(year, month - 1, day);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1, 2)}-${pad(d.getUTCDate(), 2)}` as IsoDate;
}

function toEpochDay(date: IsoDate): number {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const dt = new Date(0);
  dt.setUTCFullYear(y, m - 1, d);
  dt.setUTCHours(0, 0, 0, 0);
  return Math.round(dt.getTime() / MS_PER_DAY);
}

function fromEpochDay(epochDay: number): IsoDate {
  const dt = new Date(epochDay * MS_PER_DAY);
  return isoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Menambah (atau mengurangi, bila negatif) jumlah hari. */
export function addDays(date: IsoDate, days: number): IsoDate {
  return fromEpochDay(toEpochDay(date) + days);
}

/** Selisih hari `a - b`. */
export function diffDays(a: IsoDate, b: IsoDate): number {
  return toEpochDay(a) - toEpochDay(b);
}

/** Hari dalam pekan: 0 = Minggu ... 6 = Sabtu. */
export function dayOfWeek(date: IsoDate): number {
  // 1970-01-01 adalah hari Kamis (4).
  return (((toEpochDay(date) + 4) % 7) + 7) % 7;
}
