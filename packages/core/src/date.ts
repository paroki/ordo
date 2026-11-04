/**
 * A civil date (no time of day, no time zone) in ISO format "YYYY-MM-DD".
 *
 * All liturgical calendar computations use this type instead of a local `Date`,
 * so results never depend on the machine's time zone.
 */
export type IsoDate = `${number}-${number}-${number}`;

const MS_PER_DAY = 86_400_000;

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Builds an IsoDate from components. Month is 1-12; out-of-range values are normalized. */
export function isoDate(year: number, month: number, day: number): IsoDate {
  const d = new Date(0);
  // Use setUTCFullYear: Date.UTC maps years 0-99 to 1900-1999.
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

/** Adds a number of days (subtracts when negative). */
export function addDays(date: IsoDate, days: number): IsoDate {
  return fromEpochDay(toEpochDay(date) + days);
}

/** Difference in days, `a - b`. */
export function diffDays(a: IsoDate, b: IsoDate): number {
  return toEpochDay(a) - toEpochDay(b);
}

/** Day of the week: 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(date: IsoDate): number {
  // 1970-01-01 was a Thursday (4).
  return (((toEpochDay(date) + 4) % 7) + 7) % 7;
}

/** The year component of a date. */
export function yearOf(date: IsoDate): number {
  return Number(date.slice(0, date.indexOf("-")));
}

/** The first Sunday on or after `date` (the date itself when it is a Sunday). */
export function sundayOnOrAfter(date: IsoDate): IsoDate {
  return addDays(date, (7 - dayOfWeek(date)) % 7);
}

/** The first Sunday strictly after `date`. */
export function sundayAfter(date: IsoDate): IsoDate {
  return addDays(date, 7 - dayOfWeek(date));
}
