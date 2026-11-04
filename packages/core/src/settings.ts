/**
 * Regional options that change the date of a celebration but not the rules.
 *
 * Episcopal conferences may transfer these celebrations to a Sunday. The defaults below
 * follow the General Roman Calendar; they make no claim about any particular country.
 * Country calendars override them in their own data (see docs/PRD.md, FR-4).
 */
export type RegionalSettings = {
  /** `jan6`: 6 January. `sunday`: the Sunday between 2 and 8 January. */
  epiphany: "jan6" | "sunday";
  /** `thursday`: Easter + 39 days. `sunday`: Easter + 42 days. */
  ascension: "thursday" | "sunday";
  /** `thursday`: Easter + 60 days. `sunday`: Easter + 63 days. */
  corpusChristi: "thursday" | "sunday";
};

export const DEFAULT_SETTINGS: Readonly<RegionalSettings> = Object.freeze({
  epiphany: "jan6",
  ascension: "thursday",
  corpusChristi: "thursday",
});

/** Fills in defaults for every setting that is not provided. */
export function resolveSettings(settings: Partial<RegionalSettings> = {}): RegionalSettings {
  return { ...DEFAULT_SETTINGS, ...settings };
}
