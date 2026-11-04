# ADR-0002: Reference sources for golden tests

- Status: accepted (provisional, until the KWI ordo is available)
- Date: 2026-11-04

## Context

`AGENTS.md` requires golden tests against an official or independent reference calendar.
For M1 (liturgical time) we needed a reference, and we also needed evidence for the regional
settings used in Indonesia. The maintainer proposed two sources:

1. GCatholic.org, "Kalender Liturgi: Indonesia" (checked for 2024, 2026 and 2027).
2. The My Avitalia blog post "Kalender Liturgi 2026 (A/II - B/I)".

Neither is the official KWI ordo:

- GCatholic does not name a national source on the pages we read, and its page footer
  reserves copyright (c) GCatholic.org.
- The Avitalia post names no source and shows no license. In the copy we could read it stops
  at October 2026 and has no color information.

## Decision

1. Both sources are accepted as **secondary references** for golden tests of liturgical
   time (seasons, week numbers, movable days). The official KWI ordo, when we have it,
   always wins over them.
2. Fixtures store **facts only** (dates, seasons, week numbers) in
   `packages/core/src/reference.fixtures.ts`, with the source of each year recorded. We do not
   copy their celebration names, texts or readings, and we do not mirror their pages.
3. For 2026 the two sources agree with each other on every item we compared. Where only one
   source covers a year (2024, 2027), the fixture is single-sourced and says so.
4. The fixtures were extracted from the pages with an automated page reader on 2026-11-04,
   not transcribed by hand. Every extracted value was also computed independently by our code
   before the test was written, and the test passed without edits to either side; a negative
   control (running the same fixtures with General Roman Calendar defaults) produces
   mismatches, so the tests can fail. Extraction errors cannot be fully excluded.
5. The regional settings observed in these sources are recorded as
   `OBSERVED_INDONESIAN_SETTINGS` in the fixtures only: Epiphany on Sunday, Ascension on
   Thursday, Corpus Christi on Sunday. They are **not** shipped as the Indonesian calendar
   settings until verified against KWI documents (M3).

## Observations that affect the design

- The Roman numerals I-IV that GCatholic prints next to many days are the **psalter week**
  of the Liturgy of the Hours (for example Ordinary Time week 5 shows I), not the lectionary
  cycle and not the season week. `@ordo/core` does not compute it (see PRD, open question 7).
- 2024 contains the Monday Baptism of the Lord rule (Epiphany on Sunday 7 January, Baptism
  on Monday 8 January, Ordinary Time week 1 starting on 9 January) and matches our
  implementation. The 8 January case (2023) is not covered: the 2023 page could not be read.
- Both sources number Ordinary Time Part II backwards from Christ the King (week 34), as
  `@ordo/core` does, including the omitted weeks when a solemnity replaces a Sunday.
- GCatholic groups the Wednesday before Holy Thursday under a Triduum heading and Christmas
  Eve under a Christmas heading in the text we read. We did not rely on this: it may be a
  page-layout convention (evening-before start) or a reading artifact. `@ordo/core` starts
  the Triduum on Holy Thursday and Christmas on 25 December by date.

## Consequences

- M1 can close with golden coverage of 2024, 2026 and 2027 instead of 2000-2100. More years
  require more reference data, ideally the KWI ordo.
- Adding a year means adding a fixture entry with its source, nothing else.
- Before using GCatholic or Avitalia data beyond tests (for example to build calendar data
  files), ask the owners for permission. This ADR only covers using them to check our own
  output.
