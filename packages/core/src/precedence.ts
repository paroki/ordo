import type { Anchors } from "./anchors";
import type { AnchorRef, CalendarEntry, Color } from "./calendar";
import type { Candidate, CandidateRank, CandidateStatus, Level } from "./candidates";
import { addDays, type IsoDate, yearOf } from "./date";
import type { Season } from "./seasons";

/** A candidate while the year is being resolved. */
export type Work = {
  id: string;
  rank: CandidateRank;
  level: Level;
  color: Color;
  alternativeColors: Color[];
  status: CandidateStatus | "pending";
  /** Where it comes from: the Proper of Time, a calendar entry or an engine rule. */
  origin: "time" | "calendar" | "rule";
  /** True for entries defined relative to an anchor (used to break ties, see `compare`). */
  movable: boolean;
  entry?: CalendarEntry;
  movedFrom?: IsoDate;
  movedTo?: IsoDate;
};

export type DayWork = { date: IsoDate; season: Season; works: Work[] };

/** Table level of a calendar entry (n. 59). */
export function entryLevel(entry: CalendarEntry): Level {
  switch (entry.rank) {
    case "solemnity":
      return entry.level ?? 3;
    case "feast":
      return entry.lord === true ? 5 : 7;
    case "memorial":
      return 10;
    case "optional-memorial":
      return 12;
  }
}

/**
 * Order inside one day: Table level first (n. 59, R1). S1 gives no tie-break between two
 * celebrations of the same level, so the engine uses a deterministic one: movable entries
 * first (this makes the Immaculate Heart of Mary precede a fixed memorial, R25), then the id.
 * This tie-break is UNVERIFIED and is documented in ADR-0003.
 */
export function compare(a: Work, b: Work): number {
  if (a.level !== b.level) return a.level - b.level;
  if (a.movable !== b.movable) return a.movable ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function isImpedable(w: Work, primary: Work): boolean {
  // Only solemnities of a calendar are moved (n. 60, R3). Everything else is omitted.
  return w.origin === "calendar" && w.rank === "solemnity" && w.level >= primary.level;
}

/**
 * Decides the status of every candidate of one day. Safe to run again after a transferred
 * solemnity has been added to the day.
 */
export function resolveDay(day: DayWork): void {
  const { works, season } = day;

  // R10 (n. 14): obligatory memorials in Lent may only be celebrated as optional memorials.
  if (season === "lent") {
    for (const w of works) {
      if (w.rank === "memorial" && w.level === 10) w.level = 12;
    }
  }

  works.sort(compare);
  const live = works.filter((w) => w.status !== "transferred-out");
  // Optional memorials (level 12) are never the primary: the weekday always is a candidate.
  const primary = live.find((w) => w.level !== 12);
  if (primary === undefined) {
    throw new Error(`no primary candidate on ${day.date}`);
  }

  for (const w of live) {
    if (w === primary) {
      w.status = w.movedFrom === undefined ? "celebrated" : "transferred-in";
    } else if (isImpedable(w, primary)) {
      w.status = "transferred-out"; // the transfer step assigns `movedTo`
    } else if (w.level === 12) {
      // R16: optional memorials remain optional on weekdays (levels 9 and 13).
      w.status = primary.level === 9 || primary.level === 13 ? "optional" : "suppressed";
    } else if (w.rank === "memorial" && primary.rank === "memorial" && w.level === primary.level) {
      // R25: two obligatory memorials on one day are both listed. UNVERIFIED.
      w.status = "optional";
    } else {
      w.status = "suppressed";
    }
  }
}

export function primaryOf(works: readonly Work[]): Work | undefined {
  return works.find((w) => w.status === "celebrated" || w.status === "transferred-in");
}

function resolveRef(ref: AnchorRef, a: Anchors): IsoDate {
  return addDays(a[ref.anchor], ref.offset ?? 0);
}

/** First day to examine for a transfer: a dated exception of the entry, or the next day. */
function searchStart(w: Work, date: IsoDate, a: Anchors): IsoDate {
  for (const rule of w.entry?.transfers ?? []) {
    if (date >= resolveRef(rule.from, a) && date <= resolveRef(rule.to, a)) {
      return resolveRef(rule.target, a);
    }
  }
  return addDays(date, 1);
}

/**
 * Moves every impeded solemnity to a free day (n. 60, R3; ADR-0003, decision 4f).
 *
 * A day is free when its primary is below level 9 of the Table (so no day of levels 1-8 is
 * there) and no other solemnity has been moved to it. Impeded solemnities are handled in date
 * order, then by level, then by id, so the result is deterministic. The year boundary is not
 * crossed: a search that would leave the civil year is an error.
 */
export function transferImpeded(days: Map<IsoDate, DayWork>, year: number, a: Anchors): void {
  const impeded: { date: IsoDate; work: Work }[] = [];
  for (const [date, day] of days) {
    for (const work of day.works) {
      if (work.status === "transferred-out") impeded.push({ date, work });
    }
  }
  impeded.sort((x, y) =>
    x.date !== y.date ? (x.date < y.date ? -1 : 1) : compare(x.work, y.work),
  );

  const received = new Set<IsoDate>();
  for (const { date, work } of impeded) {
    let target = searchStart(work, date, a);
    for (;;) {
      if (yearOf(target) !== year) {
        throw new Error(`no free day in ${year} for ${work.id} impeded on ${date}`);
      }
      const day = days.get(target);
      const primary = day === undefined ? undefined : primaryOf(day.works);
      if (
        day !== undefined &&
        primary !== undefined &&
        primary.level >= 9 &&
        !received.has(target)
      ) {
        day.works.push({ ...work, status: "pending", movedFrom: date });
        resolveDay(day);
        received.add(target);
        work.movedTo = target;
        break;
      }
      target = addDays(target, 1);
    }
  }
}

export function toCandidate(w: Work): Candidate {
  if (w.status === "pending") {
    throw new Error(`unresolved candidate ${w.id}`);
  }
  const candidate: Candidate = {
    id: w.id,
    rank: w.rank,
    level: w.level,
    status: w.status,
    color: w.color,
    alternativeColors: w.alternativeColors,
  };
  if (w.movedFrom !== undefined) candidate.movedFrom = w.movedFrom;
  if (w.movedTo !== undefined) candidate.movedTo = w.movedTo;
  return candidate;
}
