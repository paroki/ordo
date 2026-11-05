# ADR-0003: General Roman Calendar data, precedence and transfers (milestone M2)

- Status: accepted
- Date: 2026-11-04

## Context

M2 adds celebrations, the precedence resolver, transfers and liturgical color for the General
Roman Calendar. The maintainer is not a liturgist, so every rule below is tied to a paragraph of
an official text. Where the text we hold is silent or ambiguous, the item is marked
**UNVERIFIED** and the work stops there (see "Open questions"). Nothing is filled from memory.

This ADR is Phase 1 of M2. It contains decisions and sources only. No engine or data code is
written until the maintainer has reviewed decisions 4a-4g and the open questions.

## Sources

| Id  | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Use                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| S1  | _Missale Romanum_, editio typica tertia (2002), Typis Vaticanis, supplied by the maintainer as `latin_missal2002.pdf` (text extraction). The title page names the edition as 2002 and lists earlier editions 1970, 1971 (reimpressio emendata) and 1975. It contains the Universal Norms on the Liturgical Year and the General Roman Calendar (nn. 1-61), the General Roman Calendar, and the General Instruction of the Roman Missal (GIRM). Accessed 2026-11-04. | Official text. Baseline for all rules and for `general.json`.                                             |
| S2  | _Calendarium Romanum_ (Typis Polyglottis Vaticanis, 1969), supplied as `Calendarium Romanum (1969).pdf`. Its Apostolic Letter says the 1969 norms stand until the revised Missal and Breviary are published.                                                                                                                                                                                                                                                        | Historical comparison only. Superseded by S1 where they differ.                                           |
| S3  | Blog "Textos para la Liturgia", transcription of the Universal Norms (`textosparalaliturgia.blogspot.com`, post of 2016-05-30). Names no edition.                                                                                                                                                                                                                                                                                                                   | Cross-check of paragraph wording only. It transcribes the Missal, so it is **not** an independent source. |

Edition recorded for the data: "Missale Romanum, editio typica tertia, 2002". We have seen no
text of a 2008 reprint (`emendata`); whether it changes any calendar entry is unknown.

### Maintainer decision: decrees after 2002 are deferred

On 2026-11-04 the maintainer decided that decrees of the Congregation or Dicastery for Divine
Worship issued after the 2002 edition are **not** applied in the MVP and will be handled after
it. The sources-before-Phase-1 rule (c) in `m2-task.md` is therefore waived for the MVP by the
maintainer, with these consequences, which must be visible and not hidden:

1. `general.json` represents the calendar as printed in S1, not the calendar in force today.
2. Golden tests for 2016, 2024 and 2026 compare against GCatholic General Roman Calendar pages,
   which follow the current calendar. Days that differ because of a later decree are listed in
   the fixtures as `expectedDiff: "decree not applied"`, with the source of each year recorded,
   and are excluded from the pass/fail comparison. Every other day must match.
3. The PRD records the M2 exit criterion as **met except decree-affected days**, not as met.
4. Entries that a decree changed are found by comparing S1 with the references, not recalled.
   Examples seen in S1: Mary Magdalene appears as a memorial on 22 July and Martha alone on
   29 July. These are examples of what a decree later changed, not entries we will edit now.
5. The data format (decision 4a) has `validFrom`/`validUntil` and a `decree` field so the
   decrees can be added later without changing the schema.

## Rules the engine will implement (R1-R20 verified against S1)

Paragraph numbers are those of the Universal Norms in S1 unless a GIRM number is given. Wording
below is ours, not copied.

| Id  | Rule                                                                                                                                                                                                                                                                                                                                                                              | Cited                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| R1  | Precedence between liturgical days is governed solely by the Table of Liturgical Days.                                                                                                                                                                                                                                                                                            | n. 59                                |
| R2  | If several celebrations fall on one day, the one higher in the Table is celebrated.                                                                                                                                                                                                                                                                                               | n. 60                                |
| R3  | A solemnity impeded by a day that has precedence is moved to the nearest day free of the days in Table levels 1-8, subject to n. 5. Other impeded celebrations are omitted for that year.                                                                                                                                                                                         | n. 60                                |
| R4  | The Annunciation, whenever it falls in Holy Week, is always moved to the Monday after the Second Sunday of Easter.                                                                                                                                                                                                                                                                | n. 60                                |
| R5  | A solemnity falling on a Sunday of Advent, Lent or Easter moves to the following Monday, except on Palm Sunday or Easter Sunday (the exception is stated, but the text says nothing further about those two days, see Q3). Sundays give way only to solemnities and feasts of the Lord, and Sundays of Advent, Lent and Easter rank above all feasts of the Lord and solemnities. | n. 5                                 |
| R6  | Sunday excludes a permanent assignment of another celebration, except: Holy Family on the Sunday in the Christmas octave, Baptism of the Lord on the Sunday after 6 January, Trinity on the Sunday after Pentecost, Christ the King on the last Sunday of Ordinary Time.                                                                                                          | n. 6                                 |
| R7  | Where Epiphany, Ascension and Corpus Christi are not holy days of obligation they go to a Sunday: Epiphany to the Sunday from 2 to 8 January, Ascension to the Seventh Sunday of Easter, Corpus Christi to the Sunday after Trinity.                                                                                                                                              | nn. 7, 25, 37                        |
| R8  | Holy Family: the Sunday in the Christmas octave, or 30 December if there is none.                                                                                                                                                                                                                                                                                                 | n. 35 a                              |
| R9  | Where the Epiphany solemnity moves to a Sunday that falls on 7 or 8 January, the Baptism of the Lord is celebrated on the Monday after.                                                                                                                                                                                                                                           | General Roman Calendar, January note |
| R10 | Obligatory memorials in Lent may only be celebrated as optional memorials. Only one optional memorial may be celebrated on a day that has several.                                                                                                                                                                                                                                | n. 14                                |
| R11 | On Saturdays of Ordinary Time without an obligatory memorial, an optional memorial of the Blessed Virgin Mary is allowed.                                                                                                                                                                                                                                                         | n. 15                                |
| R12 | Weekdays: Ash Wednesday and Holy Week Monday to Thursday rank above everything else; Advent weekdays from 17 to 24 December and all Lent weekdays rank above obligatory memorials; other weekdays yield to solemnities and feasts and combine with memorials.                                                                                                                     | n. 16                                |
| R13 | Vespers: when Vespers of the current day and First Vespers of the next fall together, the one whose celebration is higher in the Table prevails; the current day on a tie. Not needed for M2 output; recorded for later.                                                                                                                                                          | n. 61                                |
| R14 | Feasts have no First Vespers, except feasts of the Lord that replace the Sunday office in Ordinary Time and the Christmas season. Solemnities start with First Vespers.                                                                                                                                                                                                           | nn. 11, 13                           |
| R15 | The Easter octave has eight days and ranks like a solemnity of the Lord by n. 24, but in the Table the days of the octave are level 2.                                                                                                                                                                                                                                            | nn. 12, 24, 59                       |
| R16 | Optional memorials on Advent weekdays from 17 December, in the Christmas octave and in Lent: the Mass is of the day, and only the collect of the memorial may be used, except on Ash Wednesday and in Holy Week. Easter-season weekdays may have the memorial in full.                                                                                                            | GIRM n. 355 a                        |
| R17 | Liturgical color rules (white, red, green, violet, rose and black options).                                                                                                                                                                                                                                                                                                       | GIRM n. 346                          |
| R18 | A proper calendar assigns a saint's day by the general-calendar date; an impeded proper celebration is moved to the nearest unimpeded day, and some are transferred instead of the impeding one for pastoral reasons. Used from M3.                                                                                                                                               | n. 56 a-d                            |
| R19 | 17-31 December, Lent and the Easter octave are kept free of proper celebrations, except optional memorials, feasts of Table level 8 a-d and solemnities that cannot be moved. Used from M3.                                                                                                                                                                                       | n. 56 f                              |
| R20 | St Joseph (19 March) on Palm Sunday: where obligatory it moves to Saturday 18 March; where not obligatory the bishops' conference may move it outside Lent.                                                                                                                                                                                                                       | n. 56 f                              |

R20 and R5 overlap on Palm Sunday; whether R20 applies to the general calendar is Q3 and Q4.

Further rules come from a secondary source or from a maintainer decision, not from S1. They are
accepted by the maintainer for the MVP and stay **UNVERIFIED** until an official text is supplied
(see "Resolved by the maintainer"):

| Id  | Rule                                                                                                                                                                                 | Cited                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| R21 | St Joseph (19 March) falling from Palm Sunday through Divine Mercy Sunday inclusive moves to the Saturday before Palm Sunday. It also covers the Palm Sunday case of R20 (18 March). | romcal, 2008 Missale tag (secondary)                                                              |
| R22 | The Annunciation (25 March) falling from Palm Sunday through Divine Mercy Sunday inclusive moves to the Monday after Divine Mercy Sunday. The Holy Week part is R4 (n. 60).          | romcal, 2008 Missale tag (secondary)                                                              |
| R23 | All Souls (2 November) is violet, with black as the permitted alternative. White is not used.                                                                                        | GIRM n. 346 d, e (S1); order from romcal (secondary)                                              |
| R24 | Holy Saturday is white.                                                                                                                                                              | Maintainer decision; S1 gives no color for this day and romcal leaves it empty                    |
| R25 | The Immaculate Heart of Mary on the same day as another obligatory memorial: both are listed, the Immaculate Heart is first and is the primary.                                      | romcal (secondary); maintainer decision                                                           |
| R26 | Holy Thursday is white as a day of the Triduum (the day is not split into a violet Lent part and a white Mass part).                                                                 | Maintainer decision; S1 gives no color for the day in the passages searched, and romcal splits it |

### The Table of Liturgical Days (n. 59), 13 levels

The levels are numbered in S1 and grouped in three blocks. The wording is ours.

| Level | Block | Days                                                                                                                                                                                                                                                                                                                               |
| ----- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | I     | Paschal Triduum of the Passion and Resurrection of the Lord                                                                                                                                                                                                                                                                        |
| 2     | I     | Nativity, Epiphany, Ascension and Pentecost; Sundays of Advent, Lent and Easter; Ash Wednesday; Monday to Thursday of Holy Week; days within the Easter octave                                                                                                                                                                     |
| 3     | I     | Solemnities of the Lord, of the Blessed Virgin Mary and of saints in the General Roman Calendar; the Commemoration of All the Faithful Departed                                                                                                                                                                                    |
| 4     | I     | Proper solemnities: (a) principal patron of the place, (b) dedication and anniversary of the church's dedication, (c) title of the church, (d) title, founder or principal patron of an order or congregation                                                                                                                      |
| 5     | II    | Feasts of the Lord in the General Roman Calendar                                                                                                                                                                                                                                                                                   |
| 6     | II    | Sundays of the Christmas season and Sundays of Ordinary Time                                                                                                                                                                                                                                                                       |
| 7     | II    | Feasts of the Blessed Virgin Mary and of saints in the General Roman Calendar                                                                                                                                                                                                                                                      |
| 8     | II    | Proper feasts: (a) principal patron of the diocese, (b) anniversary of the dedication of the cathedral, (c) principal patron of a region, province or nation, (d) title, founder, principal patron of an order, congregation or religious province, (e) other feasts of a church, (f) other feasts in a diocesan or order calendar |
| 9     | II    | Advent weekdays from 17 to 24 December; days within the Christmas octave; Lent weekdays                                                                                                                                                                                                                                            |
| 10    | III   | Obligatory memorials of the General Roman Calendar                                                                                                                                                                                                                                                                                 |
| 11    | III   | Proper obligatory memorials: (a) secondary patron of the place, diocese, region or religious province, (b) other obligatory memorials of a diocese or order                                                                                                                                                                        |
| 12    | III   | Optional memorials (which may fall on level-9 days in the manner the GIRM and the Liturgy of the Hours describe, and which include obligatory memorials that occur in Lent)                                                                                                                                                        |
| 13    | III   | Advent weekdays up to 16 December; Christmas-season weekdays from 2 January to the Saturday after Epiphany; Easter-season weekdays from the Monday after the octave to the Saturday before Pentecost; weekdays of Ordinary Time                                                                                                    |

### Differences between S1 and S2 (discrepancy table)

S1 wins in every row, because it is the later and the maintainer-supplied baseline.

| Entry or rule                                                              | Source A (cite)                                                                                  | Source B (cite)                                                                                                                          | Decision                                                     | Basis                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Level 3, All Souls                                                         | S1 n. 59 level 3: listed without a qualifier                                                     | S2 n. 59 level 3: gives way to a Sunday that coincides                                                                                   | Follow S1: no Sunday clause; R1 says the Table alone governs | S1 is the edition in force for this baseline; see Q5                        |
| Structure of n. 60                                                         | S1 n. 60: one rule, plus the Annunciation sentence                                               | S2 n. 60: split into (a) permanent and (b) accidental occurrence                                                                         | Follow S1                                                    | S2 (a) concerns proper calendars (M3+); S2 (b) is the first sentences of S1 |
| Annunciation in Holy Week                                                  | S1 n. 60: always to the Monday after Easter II                                                   | S2 n. 60: no such sentence                                                                                                               | Follow S1 (R4)                                               | Later edition                                                               |
| Holy Family without a Sunday                                               | S1 n. 35 a: Sunday in the octave, or 30 December                                                 | S2 n. 35 a: Sunday only                                                                                                                  | Follow S1 (R8)                                               | Later edition                                                               |
| Impeded proper day (proper calendars)                                      | S1 n. 56 c-d: nearest unimpeded day; the impeding celebration moves instead for pastoral reasons | S2 n. 56 d: nearest day when impeded by a higher or equal rank, without the pastoral exception                                           | Follow S1 (R18, used in M3)                                  | Later edition                                                               |
| St Joseph and Palm Sunday                                                  | S1 n. 56 f: where obligatory, Saturday 18 March                                                  | S2 n. 56 f: the bishops' conference may move it outside Lent unless obligatory                                                           | Follow S1 (R20)                                              | Later edition                                                               |
| St Joseph and the Annunciation between Palm Sunday and Divine Mercy Sunday | S1 n. 56 f and n. 60: only Palm Sunday (St Joseph) and Holy Week (Annunciation) are covered      | romcal source, `rites/roman1969/src/calendars/general-roman/index.ts`, entries tagged as the 2008 Missale (secondary, not official text) | Follow romcal for the MVP (R21, R22), UNVERIFIED             | Maintainer decision of 2026-11-05                                           |
| Norms nn. 5, 35, 56, 59-61                                                 | S1                                                                                               | S3                                                                                                                                       | No discrepancies found against source B                      | S3 transcribes S1, so agreement is not independent evidence                 |

The text of S2 n. 5 could not be located in the extraction, so no claim is made about it.

## Decisions

### 4a. Calendar data shape

`packages/data/calendars/general.json`:

```json
{
  "calendar": "general",
  "edition": "Missale Romanum, editio typica tertia, 2002",
  "source": {
    "title": "Missale Romanum, editio typica tertia (2002), General Roman Calendar",
    "citation": "Universal Norms nn. 59-61 and the General Roman Calendar",
    "accessed": "2026-11-04"
  },
  "entries": [
    {
      "id": "annunciation",
      "when": { "kind": "fixed", "month": 3, "day": 25 },
      "rank": "solemnity",
      "color": "white",
      "validFrom": 2002,
      "validUntil": 2100,
      "decree": "edition"
    }
  ]
}
```

- `rank`: `solemnity | feast | memorial | optional-memorial`. The calendar text prints the rank
  of each entry; a missing rank means optional memorial (note to the January page of S1).
- `color`: a single color per entry; see Q2 for how it is sourced.
- `validFrom`/`validUntil`: years, both optional, inclusive. `decree` names the decree or the
  edition that justifies the range. Entries printed in S1 carry no range. The same `id` may
  appear twice only with non-overlapping ranges (for example, a rank change). `tools/validate`
  enforces this.
- Facts only: no display names. Names belong to locale data (M3).

### 4b. `when` kinds

The smallest set that covers S1:

- `fixed`: `{ month, day }`.
- `anchor`: `{ anchor, offset }`, where `anchor` is a key of the M1 `Anchors` type and `offset`
  is a number of days (negative allowed). It covers every movable entry printed in S1: Trinity,
  Corpus Christi, Sacred Heart, Immaculate Heart of Mary, Christ the King, Holy Family and
  Baptism of the Lord. No new kind is justified.

Not data entries: the days of the Proper of Time (Triduum, Easter and its octave, Ascension,
Pentecost, Ash Wednesday, Holy Week, Sundays and weekdays of the seasons). S1's calendar does not list them by date;
the engine derives them (decision 4e). The data entry list includes 6 January (Epiphany) as
`anchor: epiphany, offset 0` because S1 lists it and settings move it.

### 4c. Where calendar lookup lives

`@ordo/core` takes a typed calendar object and has no dependency on `@ordo/data`:

```ts
generateYear(year: number, options: { calendar: Calendar; settings?: Partial<RegionalSettings> })
generateDay(date: IsoDate, options: { calendar: Calendar; settings?: ... })
```

`@ordo/data` depends on `@ordo/core` for its types and exports `loadCalendar(id)` plus wrappers
`generateYear` and `generateDay` that accept `calendar: "general"` and resolve it. The PRD
wording `generateYear(year, { calendar: "general" })` therefore refers to the `@ordo/data`
wrappers. The PRD and the README are updated when the API lands (Phase 4).

### 4d. Output type

Keep M1's field name **`week`**; do not rename it to `seasonWeek`. There is no source or PRD
reason to break M1, so the PRD section 7 sketch is corrected to `week` (no breaking change).

```ts
type LiturgicalDay = LiturgicalTime & {
  celebrations: Candidate[];   // ordered by Table level, then a stable order of ids
  primary: Candidate;          // the obligatory winner (never an optional memorial)
  color: Color;                // color of the primary
  alternativeColors: Color[];  // permitted alternatives, empty when there are none
};

type Candidate = {
  id: string;
  rank: Rank | "sunday" | "weekday" | "triduum-day" | ...;
  level: 1 | 2 | ... | 13;     // Table of Liturgical Days
  status: "celebrated" | "optional" | "suppressed" | "transferred-in" | "transferred-out";
  color: Color;
  alternativeColors: Color[];
  movedFrom?: IsoDate;         // present when status is transferred-in
  movedTo?: IsoDate;           // present when status is transferred-out
};
```

An optional memorial is listed with status `optional`. It never becomes `primary`, because the
choice to celebrate it belongs to the celebrant (n. 14 and GIRM n. 355). Nothing leaves the
list without a status. The exact rank names for seasonal days are fixed in Phase 2.

### 4e. Seasonal days as candidates

Derived by the engine from `getAnchors` and `getSeason`; never stored. Ids are built from
season, week and weekday and are reserved: `tools/validate` rejects a data id that starts with
a reserved prefix.

- Sundays and weekdays: `<season>-w<week>-<weekday>`, for example `advent-w1-sunday`,
  `ordinary-time-w12-monday`, `easter-w2-sunday`.
- Named days: `ash-wednesday`, `palm-sunday`, `holy-monday`, `holy-tuesday`, `holy-wednesday`,
  `holy-thursday`, `good-friday`, `holy-saturday`, `easter-sunday`, `easter-octave-monday` to
  `easter-octave-saturday`, `ascension`, `pentecost`.
- Dated seasonal days: `advent-dec-17` to `advent-dec-24`; `christmas-dec-29` to
  `christmas-dec-31` (octave); `christmas-sunday-2`; `christmas-jan-02` onward to the Saturday
  after Epiphany.

Later `extends` layers and patches (M3 and after) refer to entries by `id` with add, replace,
remove and re-rank. Because ids are stable slugs and the validity range is part of the entry,
no schema change is needed to support them.

### 4f. Transfer algorithm

Deterministic and recorded:

1. Place all candidates of the year. Resolve each day by the Table (R1, R2).
2. Collect impeded solemnities in date order; ties by Table level, then by id.
3. For each, find the first day, after the impeded date, that has no candidate of Table levels
   1-8 and is not already receiving a transferred solemnity (R3). The Annunciation in Holy
   Week and solemnities on Sundays use their dedicated targets (R4, R5).
4. Mark the original as `transferred-out` with `movedTo`, and the target as `transferred-in`
   with `movedFrom`.
5. Other impeded celebrations become `suppressed`.

The year boundary is not crossed: the only transfers whose targets can leave the civil year
would come from December solemnities, and the text names no such case. If a later source says
otherwise, this ADR is amended.

The direction of "nearest" is not stated by the text. R21 and R22 give the destination for the
two solemnities that can be impeded by the Easter cycle, and they go in opposite directions (St
Joseph backward, the Annunciation forward). They are therefore data on the entry, a list of
date exceptions of the form "when the date is between anchor A and anchor B, move to anchor C
plus an offset", not part of the generic search. Phase 2 fixes the exact shape. The generic
forward search of step 3 applies to every other impeded solemnity.

### 4g. Slug convention

- Lowercase ASCII kebab-case: `^[a-z0-9]+(-[a-z0-9]+)*$`, at most 64 characters.
- English common name without honorifics: `john-bosco`, `thomas-aquinas`.
- Feast titles use the mystery: `annunciation`, `immaculate-conception`.
- Joint celebrations use one slug joined with `-and-` in calendar order:
  `basil-the-great-and-gregory-nazianzen`.
- Namesakes get an epithet or place suffix the first time a second one is added (for example
  `-the-baptist`, `-of-avila`). A published slug never changes; a rename keeps the old slug as
  an alias in a patch.
- Slugs are authored by us, never copied from a source.

## Resolved by the maintainer (2026-11-05)

| Id  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Basis and status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | R21 and R22 apply. In 2008 (Easter 23 March) St Joseph goes to Saturday 15 March and the Annunciation to Monday 31 March.                                                                                                                                                                                                                                                                                                                                                                                                                                   | Rules read from the romcal repository source (`rites/roman1969/src/calendars/general-roman/index.ts`, MIT licence, commit 9c45001 of 2026-11-01), where both entries carry the tag for the 2008 Missale. Secondary source, not an official text, **UNVERIFIED**. romcal's published npm package 3.0.0 placed St Joseph on Tuesday 18 March 2008, which contradicts n. 16 a, so it was not used. The 2008 golden test checks these two days and marks them `expectedDiff` if the reference disagrees. If an official text differs, only these two entries change. |
| Q2  | Option A: an explicit `color` per entry, generated by applying GIRM n. 346 to the category printed in the calendar text, with the paragraph cited per entry.                                                                                                                                                                                                                                                                                                                                                                                                | Maintainer decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Q3  | Closed. St Joseph and the Annunciation use R21 and R22. The Immaculate Conception on an Advent Sunday moves to Monday by n. 5 (R5), which romcal also encodes. A solemnity on a Sunday of Lent or Easter moves to Monday by n. 5.                                                                                                                                                                                                                                                                                                                           | S1 n. 5 and romcal. The Annunciation on a Sunday of Lent has no exception in the romcal entry; it is tested with a synthetic calendar and follows n. 5.                                                                                                                                                                                                                                                                                                                                                                                                          |
| Q4  | Closed. R21 applies to the general calendar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | romcal keeps the rule in its general calendar entry (secondary), accepted by the maintainer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Q5  | Closed. All Souls on a Sunday of Ordinary Time is celebrated (R1: Table level 3 over level 6).                                                                                                                                                                                                                                                                                                                                                                                                                                                              | S1 n. 59, consistent with romcal, which has no Sunday exception.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Q6  | Closed for the MVP by R25. S1 has no tie-break between celebrations of the same Table level. In 2026 the Immaculate Heart of Mary falls on 13 June, an obligatory memorial in the S1 calendar. Two solemnities of the same level (Nativity of John the Baptist with the Sacred Heart, as in 2022) have no rule and are not implemented: the Sacred Heart falls on 30 May 2008, 3 June 2016, 7 June 2024 and 12 June 2026, so the golden years are not affected. The Dicastery response of 2022 is the text needed later and is a decree, so it is deferred. | Maintainer decision on top of romcal behavior (secondary), UNVERIFIED. The 2026 reference page decides the check.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Q7  | Closed. Only the Mass side is modeled (R16, GIRM n. 355 a). The Liturgy of the Hours is not modeled in the MVP, and romcal does not model it either.                                                                                                                                                                                                                                                                                                                                                                                                        | Maintainer decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Q8  | All Souls: R23. Holy Saturday: R24 (white). Holy Thursday: see Q10.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | R23: GIRM n. 346 d, e. R24: maintainer decision, UNVERIFIED.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Q9  | No total per rank is stated in S1; the maintainer confirmed this and our search found none. Phase 3 does not run a totals check and says "no total stated".                                                                                                                                                                                                                                                                                                                                                                                                 | Maintainer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Q10 | Closed. Holy Thursday is white (R26).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Maintainer decision, UNVERIFIED. The golden reference checks it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## Open questions (UNVERIFIED, work stops here)

None open. The rules accepted from a secondary source or by decision (R21 to R26) stay UNVERIFIED
until an official text is supplied; each is checked by a golden test where a reference exists.

## Consequences

- Phase 2 can implement R1-R12, R14-R17 and R21-R26 with small synthetic calendars. No open question blocks it.
- `general.json` is limited to S1 until the decrees phase. This is recorded in the PRD.
- The engine stays pure: dates are `IsoDate`, ids are slugs, nothing is a display string.
- Text from S1 is not stored. The Table above is a paraphrase in our own words.

## Amendment 1: engine details settled in Phase 2 (proposed, awaiting maintainer review)

The accepted decisions stay as written. Implementing the engine needed the details below. None
of them states a liturgical fact: facts still come only from S1 and from the rules R1-R26. Items
marked UNVERIFIED are engine choices where S1 gives no rule.

1. **Two optional entry fields.** The Table separates feasts of the Lord (level 5) from other
   feasts (level 7) and places the Nativity and the Epiphany at level 2, but decision 4a had only
   `rank`. Entries may carry `lord: true` (only with `rank: "feast"`) and `level: 2` (only with
   `rank: "solemnity"`). Phase 3 sets them from S1, entry by entry, with the paragraph cited.
2. **Colors of derived days live in the calendar file.** The calendar has a `timeColors` object:
   `seasons` (one color per season, including the Triduum) and `overrides` (by derived id, with
   optional alternative colors, for example rose). The color of a derived day is
   `overrides[id]`, otherwise `seasons[season]`. This keeps every color in data (architecture
   rule 4) and follows Q2. R24 and R26 become two overrides (`holy-saturday`, `holy-thursday`),
   R23 stays on the All Souls entry. Phase 3 fills the object from GIRM n. 346 with the paragraph
   cited per value. The engine contains no color.
3. **Dated transfer exceptions.** Decision 4f left the shape to Phase 2. An entry may carry
   `transfers: [{ from, to, target }]`, each an anchor plus offset. When the entry is impeded on a
   date between `from` and `to` (inclusive), the search for a free day starts at `target`
   instead of the day after. R21 and R22 are data of this form (UNVERIFIED, see Q1).
4. **Free day.** A day is free when its primary has Table level 9 or a larger number (9 to 13, so no
   day of levels 1-8 is there) and no other solemnity has been moved to it. The search then goes forward day by day
   from the start day. A search that would leave the civil year is an error (decision 4f).
   Impeded solemnities are processed by date, then Table level, then id.
5. **Same-level ties (UNVERIFIED, S1 has no rule, see Q6).** Order inside a level: movable
   entries first, then id. Of two solemnities of one level the first is celebrated and the
   second is moved by the generic search. Of two obligatory memorials the first is the primary
   and the second is `optional` (this is R25 for the Immaculate Heart of Mary). Of two feasts
   the second is `suppressed`.
6. **Memorials on level 9 days.** R10 (Lent) turns an obligatory memorial into an optional one
   (level 12). On 17-24 December and in the Christmas octave an obligatory memorial is
   `suppressed`, by R12 and R3. Optional memorials stay `optional` on level 9 and level 13 days
   (R16) and are `suppressed` on every higher day.
7. **The weekday stays listed.** When a higher celebration is the primary, the weekday of the
   Proper of Time stays in `celebrations` with status `suppressed`. The weekday cycles still
   come from `LiturgicalTime`.
8. **Saturday memorial of Mary (R11).** The engine derives the candidate
   `saturday-memorial-of-mary` (optional memorial, level 12) on every Saturday of Ordinary
   Time. Its color is `timeColors.overrides["saturday-memorial-of-mary"]`, which a calendar must
   define.
9. **Easter Sunday.** The Table text in this ADR puts Easter Sunday among the Sundays of Easter
   (level 2) and the Triduum at level 1. Whether Easter Sunday also belongs to level 1 is not
   settled here. It changes no output, since no celebration can compete with it at level 1 or 2.
   Checked against n. 59 when the Table is next read.
10. **Derived ids.** In addition to decision 4e: `christmas-dec-25` is the weekday under the
    Nativity, `christmas-jan-01` is the weekday under 1 January, and `ordinary-time-w<n>-<day>`,
    `easter-octave-<day>` and the other names follow 4e. Derived ranks: `sunday` for every
    Sunday, `triduum` for Holy Thursday to Holy Saturday, `solemnity` for Ascension, Pentecost
    and the octave days, `weekday` otherwise.
11. **Order of `celebrations`.** By Table level, so an optional memorial (level 12) is listed
    before a level 13 weekday that is the primary. Use `primary` to find the winner.

### Phase 2 coverage

| Rule                           | Test                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| R1, R2, R5, R6                 | `precedence.test.ts`, "R1, R2", "R5"                                |
| R3, R4, R21, R22               | `precedence.test.ts`, "R3", "R4, R21, R22" (2008 and 2016 dates)    |
| R10, R11, R12, R16, R25        | `precedence.test.ts`, "R10, R11, R12, R16"                          |
| R15 and the Table levels       | `time-days.test.ts`                                                 |
| R17, R24, R26 (mechanism only) | `precedence.test.ts`, "R17: color"                                  |
| R7, R8, R9                     | M1 (`anchors.test.ts`), unchanged                                   |
| R13, R14, R18-R20              | not implemented: Vespers is not modeled, and the rest belongs to M3 |
| Properties                     | `generate.property.test.ts`, 2000-2100, run under three TZ values   |
