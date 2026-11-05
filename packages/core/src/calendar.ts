import type { Anchors } from "./anchors";
import type { Season } from "./seasons";

/** Rank of an entry as printed in a calendar (ADR-0003, decision 4a). */
export type Rank = "solemnity" | "feast" | "memorial" | "optional-memorial";

export type Color = "white" | "red" | "green" | "violet" | "rose" | "black";

/** Names of the dates that `getAnchors` computes for a civil year. */
export type AnchorName = Exclude<keyof Anchors, "year">;

/** A date defined as an anchor plus an offset in days (negative allowed, default 0). */
export type AnchorRef = { anchor: AnchorName; offset?: number };

/** ADR-0003, decision 4b: the smallest set of `when` kinds that covers the calendar. */
export type When =
  | { kind: "fixed"; month: number; day: number }
  | { kind: "anchor"; anchor: AnchorName; offset: number };

/**
 * A dated exception to the generic transfer search (ADR-0003, decision 4f).
 * When the entry is impeded and its date lies between `from` and `to` (both inclusive), the
 * search for a free day starts at `target` instead of the day after the impeded date.
 */
export type TransferRule = { from: AnchorRef; to: AnchorRef; target: AnchorRef };

export type CalendarEntry = {
  /** Stable kebab-case slug. */
  id: string;
  when: When;
  rank: Rank;
  color: Color;
  /** Other permitted colors (for example rose). */
  alternativeColors?: Color[];
  /**
   * Feast of the Lord: a feast at level 5 of the Table of Liturgical Days instead of level 7.
   * Only meaningful for `rank: "feast"`.
   */
  lord?: true;
  /**
   * Explicit Table level for the solemnities the Table places at level 2 (Nativity, Epiphany).
   * Only `2` is allowed, and only for `rank: "solemnity"`.
   */
  level?: 2;
  /** First civil year (inclusive) in which the entry applies. */
  validFrom?: number;
  /** Last civil year (inclusive) in which the entry applies. */
  validUntil?: number;
  /** The decree or edition that justifies the validity range. */
  decree?: string;
  transfers?: TransferRule[];
};

export type TimeColor = { color: Color; alternativeColors?: Color[] };

/**
 * Colors of the days the engine derives (the Proper of Time). They are data, not code, so the
 * engine states no liturgical fact about color (ADR-0003, amendment 1).
 *
 * The color of a derived day is `overrides[id]` when present, otherwise `seasons[season]`.
 * `overrides` must contain `saturday-memorial-of-mary` (the optional Saturday memorial of the
 * Blessed Virgin Mary is derived, not listed in `entries`).
 */
export type TimeColors = {
  seasons: Record<Season, Color>;
  overrides?: Record<string, TimeColor>;
};

export type Calendar = {
  calendar: string;
  edition: string;
  source: { title: string; citation: string; accessed: string };
  timeColors: TimeColors;
  entries: CalendarEntry[];
};
