import { adventSunday } from "./anchors";
import { type IsoDate, yearOf } from "./date";

export type SundayCycle = "A" | "B" | "C";
export type WeekdayCycle = "I" | "II";

/**
 * Lectionary cycle of Sundays and solemnities. The liturgical year begins on the First
 * Sunday of Advent and takes the number of the civil year in which it ends: Year A when that
 * number leaves remainder 1 when divided by 3, B for remainder 2, C when divisible by 3.
 */
export function sundayCycle(date: IsoDate): SundayCycle {
  const year = yearOf(date);
  const liturgicalYear = date >= adventSunday(year) ? year + 1 : year;
  const remainder = liturgicalYear % 3;
  return remainder === 1 ? "A" : remainder === 2 ? "B" : "C";
}

/**
 * Lectionary cycle of weekdays in Ordinary Time: Year I in odd-numbered civil years,
 * Year II in even-numbered ones. This function applies that rule to the civil year of the
 * date for every day; how the cycle is used outside Ordinary Time is a concern of the readings
 * milestone (see docs/PRD.md, M5).
 */
export function weekdayCycle(date: IsoDate): WeekdayCycle {
  return yearOf(date) % 2 === 1 ? "I" : "II";
}
