import type { Color, Rank } from "./calendar";
import type { IsoDate } from "./date";
import type { LiturgicalTime } from "./time";

/** Level in the Table of Liturgical Days (Universal Norms n. 59). 1 is the highest. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Rank of a candidate. Calendar entries keep their printed rank. Derived days use:
 * `sunday` (every Sunday, including Palm Sunday and Easter Sunday), `triduum` (Holy Thursday
 * to Holy Saturday), `solemnity` (Ascension, Pentecost and the days of the Easter octave) and
 * `weekday` (every other derived day).
 */
export type CandidateRank = Rank | "sunday" | "weekday" | "triduum";

/**
 * - `celebrated`: the primary celebration of the day.
 * - `optional`: may be celebrated instead of the day's weekday (optional memorials, and
 *   obligatory memorials that fall in Lent or share a day with another memorial).
 * - `suppressed`: impeded by a celebration that ranks higher and not celebrated this year.
 * - `transferred-out`: a solemnity impeded on this date; see `movedTo`.
 * - `transferred-in`: a solemnity moved here from `movedFrom`; it is the primary.
 */
export type CandidateStatus =
  | "celebrated"
  | "optional"
  | "suppressed"
  | "transferred-out"
  | "transferred-in";

export type Candidate = {
  /** Calendar entry id, or a derived id of the Proper of Time (ADR-0003, decision 4e). */
  id: string;
  rank: CandidateRank;
  level: Level;
  status: CandidateStatus;
  color: Color;
  alternativeColors: Color[];
  /** Present when `status` is `transferred-in`. */
  movedFrom?: IsoDate;
  /** Present when `status` is `transferred-out`. */
  movedTo?: IsoDate;
};

export type LiturgicalDay = LiturgicalTime & {
  /** Every candidate of the day, ordered by Table level, then movable entries, then id. */
  celebrations: Candidate[];
  /** The obligatory winner. Never an optional memorial. It is one of `celebrations`. */
  primary: Candidate;
  /** Color of the primary. */
  color: Color;
  /** Permitted alternatives to `color`; empty when there are none. */
  alternativeColors: Color[];
};
