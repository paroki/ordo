import { type Anchors, getAnchors } from "./anchors";
import { addDays, dayOfWeek, diffDays, type IsoDate, yearOf } from "./date";
import type { RegionalSettings } from "./settings";

export type Season = "advent" | "christmas" | "ordinary-time" | "lent" | "triduum" | "easter";

export type SeasonInfo = {
  season: Season;
  /**
   * Week of the season, defined as the number of the most recent Sunday of that season
   * (a Sunday belongs to its own week). Absent in the Christmas season and the Triduum.
   *
   * - Advent: 1-4.
   * - Lent: 0 for Ash Wednesday through the following Saturday, 1-5 for the Sundays of Lent
   *   and their weekdays, 6 for Palm Sunday and the rest of Holy Week up to Wednesday.
   * - Easter: 1-7, and 8 for Pentecost Sunday.
   * - Ordinary Time: 1-34. Part II is numbered backwards so that Christ the King is week 34.
   */
  week?: number;
  /** True from Palm Sunday through Holy Saturday. */
  holyWeek: boolean;
};

function info(season: Season, holyWeek: boolean, week?: number): SeasonInfo {
  return week === undefined ? { season, holyWeek } : { season, week, holyWeek };
}

/**
 * Season of a date, given the anchors of its civil year.
 *
 * Modeling convention: seasons are assigned per calendar date. Holy Thursday, Good Friday and
 * Holy Saturday form the Triduum, although the morning of Holy Thursday still belongs to Lent.
 * Easter Sunday starts the Easter season; the Easter season ends with Pentecost Sunday.
 */
export function seasonFromAnchors(date: IsoDate, a: Anchors): SeasonInfo {
  const holyWeek = date >= a.palmSunday && date <= a.holySaturday;

  if (date <= a.baptismOfTheLord) {
    return info("christmas", false);
  }

  if (date < a.ashWednesday) {
    // Ordinary Time, part I. Counting starts from the Sunday of the Baptism of the Lord (or
    // the Sunday before it, when the Baptism is celebrated on a Monday).
    const firstSunday =
      dayOfWeek(a.baptismOfTheLord) === 0 ? a.baptismOfTheLord : addDays(a.baptismOfTheLord, -1);
    return info("ordinary-time", false, 1 + Math.floor(diffDays(date, firstSunday) / 7));
  }

  if (date < a.holyThursday) {
    const firstSundayOfLent = addDays(a.ashWednesday, 4);
    const week =
      date < firstSundayOfLent ? 0 : 1 + Math.floor(diffDays(date, firstSundayOfLent) / 7);
    return info("lent", holyWeek, week);
  }

  if (date < a.easter) {
    return info("triduum", true);
  }

  if (date <= a.pentecost) {
    return info("easter", false, 1 + Math.floor(diffDays(date, a.easter) / 7));
  }

  if (date < a.adventI) {
    // Ordinary Time, part II, numbered backwards from Christ the King (34th Sunday).
    const sunday = addDays(date, -dayOfWeek(date));
    return info("ordinary-time", false, 34 - diffDays(a.christTheKing, sunday) / 7);
  }

  if (date < a.christmas) {
    return info("advent", false, 1 + Math.floor(diffDays(date, a.adventI) / 7));
  }

  return info("christmas", false);
}

/** Season of a date. Use `seasonFromAnchors` when processing many dates of the same year. */
export function getSeason(date: IsoDate, settings?: Partial<RegionalSettings>): SeasonInfo {
  return seasonFromAnchors(date, getAnchors(yearOf(date), settings));
}
