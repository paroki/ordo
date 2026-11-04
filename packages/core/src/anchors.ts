import { easter } from "./computus";
import { addDays, dayOfWeek, type IsoDate, isoDate, sundayAfter, sundayOnOrAfter } from "./date";
import { type RegionalSettings, resolveSettings } from "./settings";

/**
 * Dates, within one civil year, from which the whole liturgical time is derived.
 * Every date belongs to the given civil year (for example `baptismOfTheLord` is in
 * January and `adventI` in November or December of that same year).
 */
export type Anchors = {
  year: number;
  easter: IsoDate;
  ashWednesday: IsoDate;
  palmSunday: IsoDate;
  holyThursday: IsoDate;
  goodFriday: IsoDate;
  holySaturday: IsoDate;
  ascension: IsoDate;
  pentecost: IsoDate;
  trinitySunday: IsoDate;
  corpusChristi: IsoDate;
  sacredHeart: IsoDate;
  immaculateHeart: IsoDate;
  epiphany: IsoDate;
  baptismOfTheLord: IsoDate;
  adventI: IsoDate;
  christmas: IsoDate;
  holyFamily: IsoDate;
  christTheKing: IsoDate;
};

/** First Sunday of Advent: the fourth Sunday before 25 December. */
export function adventSunday(year: number): IsoDate {
  const christmas = isoDate(year, 12, 25);
  const weekday = dayOfWeek(christmas);
  // The Sunday before Christmas; a full week earlier when Christmas is itself a Sunday.
  const fourthSunday = addDays(christmas, -(weekday === 0 ? 7 : weekday));
  return addDays(fourthSunday, -21);
}

function epiphanyDate(year: number, mode: RegionalSettings["epiphany"]): IsoDate {
  return mode === "jan6" ? isoDate(year, 1, 6) : sundayOnOrAfter(isoDate(year, 1, 2));
}

function baptismDate(year: number, epiphany: IsoDate, mode: RegionalSettings["epiphany"]): IsoDate {
  if (mode === "jan6") {
    // The Sunday after 6 January.
    return sundayAfter(isoDate(year, 1, 6));
  }
  // Epiphany on a Sunday: the Baptism is the following Sunday, except when Epiphany falls
  // on 7 or 8 January, in which case it is celebrated on the Monday that follows.
  const day = Number(epiphany.slice(-2));
  return day >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
}

function holyFamilyDate(year: number): IsoDate {
  const christmas = isoDate(year, 12, 25);
  // The Sunday within the octave of Christmas; 30 December when Christmas is a Sunday.
  return dayOfWeek(christmas) === 0 ? isoDate(year, 12, 30) : sundayAfter(christmas);
}

/** Computes the anchors of a civil year. Offsets are counted in days from Easter. */
export function getAnchors(year: number, settings?: Partial<RegionalSettings>): Anchors {
  const s = resolveSettings(settings);
  const easterDate = easter(year);
  const from = (days: number): IsoDate => addDays(easterDate, days);

  const epiphany = epiphanyDate(year, s.epiphany);
  const adventI = adventSunday(year);

  return {
    year,
    easter: easterDate,
    ashWednesday: from(-46),
    palmSunday: from(-7),
    holyThursday: from(-3),
    goodFriday: from(-2),
    holySaturday: from(-1),
    ascension: from(s.ascension === "thursday" ? 39 : 42),
    pentecost: from(49),
    trinitySunday: from(56),
    corpusChristi: from(s.corpusChristi === "thursday" ? 60 : 63),
    sacredHeart: from(68),
    immaculateHeart: from(69),
    epiphany,
    baptismOfTheLord: baptismDate(year, epiphany, s.epiphany),
    adventI,
    christmas: isoDate(year, 12, 25),
    holyFamily: holyFamilyDate(year),
    christTheKing: addDays(adventI, -7),
  };
}
