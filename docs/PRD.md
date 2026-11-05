# Ordo: Product Requirements Document

- Status: draft 0.1
- Last updated: 2026-11-04
- Owner: Paroki Developers
- Related: [ADR-0001](adr/0001-scope-and-architecture.md), [AGENTS.md](../AGENTS.md)

This document is the source of truth for **what** we build and **when**. Architecture
decisions (**how**) live in [`docs/adr`](adr). When a milestone is completed, update its
status in section 9 in the same commit.

## 1. Summary

Ordo is an open source engine and web application that generates the Catholic liturgical
calendar (an _ordo_) for any year and for a chosen calendar: the General Roman Calendar
first, then national propria, then dioceses and religious orders. It produces correct,
machine-readable data (and later printable and subscribable calendars), and keeps calendar
rules, translations and readings as separate concerns so that any country can contribute.

## 2. Problem

- Parishes, dioceses and orders often prepare the annual ordo by hand or copy it from printed
  books. Transfers of solemnities and precedence conflicts are easy to get wrong.
- Calendar data locked in PDFs or books is hard to reuse in apps, websites and calendar
  clients.
- Each country or project tends to re-implement the same computus and precedence rules, with
  the same classes of bugs (time zones, transfers, week numbering).

## 3. Goals and non-goals

### Goals

| ID  | Goal                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| G1  | Correctness: the generated calendar matches the official reference for every day tested.         |
| G2  | Determinism: same input always gives the same output, independent of machine and time zone.      |
| G3  | Extensibility: new calendars (country, diocese, order) and languages are data, not code changes. |
| G4  | Reusability: a pure TypeScript core usable from CLI, server, browser and other apps.             |
| G5  | Open contribution: contributors from any country can add data and translations safely.           |

### Non-goals (v1)

- Extraordinary Form (1962) calendar, Eastern rites and the Ambrosian rite.
- Full text of the Lectionary, Missal or Liturgy of the Hours.
- User accounts, personal data storage or social features.
- Native mobile apps (the web app should be responsive; ICS covers phone calendars).

## 3.1 Users

| Persona                              | Needs                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Parish liturgy coordinator/secretary | See any day, week or month; know the color, rank and season; print or share |
| Parishioner                          | Subscribe to the calendar on a phone; read it in their own language         |
| Diocesan or order ordo editor        | Layer local celebrations on top of the national calendar without forking    |
| Developer/integrator                 | Stable JSON/ICS endpoints and a pure library                                |
| Contributor (liturgist, translator)  | Edit data or translations in simple files, with CI feedback                 |

## 4. Scope

### In scope for the first public release (v0.1, end of M4)

- Calendars: `general` and `id` (Indonesian proprium, KWI as reference).
- Locale: `id` only; the i18n structure supports more.
- Years: 1583 and later (Gregorian), tested for 2000-2100.
- Web app: year, month and day views; calendar and locale selection.
- Exports: ICS and JSON.

### Planned later

Daily readings references, diocesan and order calendars, printable PDF ordo, more locales and
countries, a stable public API (see milestones).

## 5. Functional requirements

Priority: **M** = must, **S** = should, **C** = could.

| ID    | Requirement                                                                                                                                | Pri | Milestone |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | --- | --------- |
| FR-1  | Compute the date of Easter and all movable days (Ash Wednesday, Holy Week and Triduum, Ascension, Pentecost, Trinity, Corpus Christi, ...) | M   | M1        |
| FR-2  | Compute season boundaries (Advent, Christmas, Ordinary Time I and II, Lent, Triduum, Easter) and week numbering                            | M   | M1        |
| FR-3  | Compute Sunday cycle (A/B/C) and weekday cycle (I/II) for any date                                                                         | M   | M1        |
| FR-4  | Support regional settings (Epiphany, Ascension, Corpus Christi on Thursday or Sunday, holy days of obligation, first day of the week)      | M   | M1, M3    |
| FR-5  | Load the General Roman Calendar from data and place fixed-date celebrations on the year                                                    | M   | M2        |
| FR-6  | Resolve precedence between celebrations using the Table of Liturgical Days; expose every celebration of the day and the winner             | M   | M2        |
| FR-7  | Apply transfer and suppression rules (for example solemnities displaced by Sundays or Holy Week)                                           | M   | M2        |
| FR-8  | Determine the liturgical color of each day                                                                                                 | M   | M2        |
| FR-9  | Layer calendars with `extends` and patches (add, replace, remove, re-rank)                                                                 | M   | M3        |
| FR-10 | Localize output through ID-based translation files with a fallback chain; never fall back to an empty string                               | M   | M3        |
| FR-11 | Validate calendar and locale data in CI (schema, unique IDs, no dangling patches, missing translation keys)                                | M   | M2, M3    |
| FR-12 | Export a year or range as JSON and ICS                                                                                                     | M   | M4        |
| FR-13 | Web UI: year, month and day views, calendar and locale switcher, print-friendly styles                                                     | M   | M4        |
| FR-14 | Public read-only HTTP endpoints for JSON and ICS (resource routes)                                                                         | S   | M4        |
| FR-15 | Daily readings as references only (book, chapter, verse range), no scripture text                                                          | S   | M5        |
| FR-16 | Diocesan and religious order calendars as `extends` layers                                                                                 | S   | M6        |
| FR-17 | Printable ordo as PDF                                                                                                                      | C   | M6        |
| FR-18 | Additional locales and national calendars contributed by the community                                                                     | S   | M7        |
| FR-19 | Stable, versioned public API with a compatibility policy                                                                                   | S   | M7        |

## 6. Non-functional requirements

- **Correctness first.** Calendar facts come from authoritative sources and are recorded per
  data file. Behavior is verified by golden tests against an official or independent
  reference, plus property tests (for example: Easter is always a Sunday between 22 March and
  25 April).
- **Determinism.** Dates are date-only ISO strings (`YYYY-MM-DD`, UTC semantics); nothing
  depends on the machine's time zone or locale.
- **Purity.** `@ordo/core` has no I/O, no runtime dependencies and returns no display strings.
- **Performance (target, not yet measured).** Generating one calendar year takes well under
  100 ms on a typical laptop, so it can run per request or in the browser.
- **i18n.** Names and labels come only from locale data; date formatting uses `Intl`.
- **Accessibility.** The web app targets WCAG 2.2 AA (contrast of liturgical colors, keyboard
  navigation, no information conveyed by color alone).
- **Privacy.** No accounts and no personal data. No analytics that identify individuals.
- **Maintainability.** Strict TypeScript, Biome, CI on every PR, English-only code and docs.
- **Licensing.** Code is MIT. Third-party material (for example KWI texts and names) is used
  only with permission; until then data files contain facts only.

## 7. Output model (indicative)

The exact types are defined in `@ordo/core`; this is the shape product requirements rely on.

```ts
type LiturgicalDay = {
  date: string; // "2026-11-29"
  season: Season;
  week?: number;
  weekday: number; // 0 = Sunday
  celebrations: Celebration[]; // all candidates, ordered by precedence
  primary: Celebration; // the winner
  color: "white" | "red" | "green" | "violet" | "rose" | "black";
  sundayCycle?: "A" | "B" | "C";
  weekdayCycle?: "I" | "II";
};

type Celebration = {
  id: string; // stable slug, e.g. "immaculate-conception"
  rank: Rank; // solemnity, feast, memorial, optional-memorial, ...
  color?: string;
};
```

## 8. Calendar layers

```
General Roman Calendar -> national proprium (KWI) -> diocese -> parish/order
```

Each layer can add, replace, remove or re-rank entries of the layer above. Each calendar has
an `edition` and `validFrom`, so different years can follow different editions.

## 9. Milestones

Status legend: done, in progress, planned.

| Milestone | Title                          | Release | Status      |
| --------- | ------------------------------ | ------- | ----------- |
| M0        | Foundation                     | -       | done        |
| M1        | Liturgical time                | -       | done        |
| M2        | General Roman Calendar         | -       | in progress |
| M3        | Indonesian calendar and locale | -       | planned     |
| M4        | Web app and exports            | v0.1    | planned     |
| M5        | Readings references            | v0.2    | planned     |
| M6        | Diocesan calendars and PDF     | v0.3    | planned     |
| M7        | More countries and public API  | v1.0    | planned     |

### M0: Foundation (done)

- [x] Bun monorepo, strict TypeScript, Biome, `bun test`
- [x] CI (lint, typecheck, test)
- [x] `@ordo/core`: `easter()` and date-only helpers with golden and property tests
- [x] ADR-0001, MIT license, README
- [x] `AGENTS.md` (with `CLAUDE.md` and `GEMINI.md` pointing to it) and the emoji commit convention

### M1: Liturgical time (done, with limited golden coverage)

Scope: everything derived from Easter and Christmas, no celebration data yet.

- [x] Movable days from Easter (Ash Wednesday, Palm Sunday, Triduum, Ascension, Pentecost,
  Trinity Sunday, Corpus Christi, Sacred Heart, Immaculate Heart of Mary)
- [x] Advent, Christmas season anchors, Holy Family, Epiphany and Baptism of the Lord
- [x] Ordinary Time parts I and II with correct week numbering (Christ the King is week 34)
- [x] Season for any date, with season week
- [x] Sunday cycle (A/B/C) and weekday cycle (I/II)
- [x] Regional settings object (Epiphany, Ascension, Corpus Christi) with General Roman
  Calendar defaults
- [x] Reference calendar chosen and recorded in an ADR ([ADR-0002](adr/0002-reference-sources-for-golden-tests.md))

Exit criteria:

- [x] Anchors and seasons match the chosen reference for every year it covers. **Changed
  from the original "every year in 2000-2100"**: the available secondary sources cover only
  2024 to 2029 (Sundays with a season and week number, selected weekdays, and
  movable days). Wider coverage needs the KWI ordo or another reference.
- [x] Property tests pass (seasons follow the liturgical order with no gaps or overlaps,
  week numbering is consistent, checked for 1900-2200 with both Epiphany settings).
- [x] Public API documented in the README with examples.

Status notes:

- Golden tests are in `packages/core/src/reference.test.ts`. The sources are secondary
  (GCatholic.org and a blog), not the official ordo, and the case of Epiphany on 8 January (2023)
  is not covered by any reference. M3 repeats the comparison against the KWI ordo.
- Conventions that need liturgist review before they are relied on: the week number of Lent
  weekdays before the first Sunday (0) and of Holy Week (6), Easter Sunday through Pentecost
  as weeks 1-8, and the weekday cycle applied by civil year for every day (the readings
  milestone M5 decides how it is used outside Ordinary Time).
- Settings defaults are General Roman Calendar values, not Indonesian ones. The Indonesian
  values observed in the references are recorded in ADR-0002 and are not shipped until
  verified (see open question 2).

### M2: General Roman Calendar

Scope: fixed celebrations and the precedence engine for `general`.

- [ ] `packages/data` with `calendars/general.json` (facts only, source recorded)
- [x] Fixed and offset-based placement of celebrations (engine, tested with synthetic calendars)
- [x] Precedence resolver based on the Table of Liturgical Days (engine, tested with synthetic calendars)
- [x] Transfer and suppression rules (solemnities, Lent and Holy Week restrictions) (engine; the
  general data and the golden years are not checked yet)
- [ ] Liturgical color per day
- [ ] `tools/validate`: JSON schema, unique IDs, valid slugs, run in CI
- [ ] `generateYear(year, { calendar: "general" })` and `generateDay`

Exit criteria:

- Sampled difficult years (for example 2008, 2016, 2024, 2026) match the reference on every
  day for rank, color and winner.
- Every transfer rule has at least one dedicated test case.

Status notes:

- Phase 1 (ADR-0003, accepted) and Phase 2 (engine in `@ordo/core` with synthetic calendars,
  Amendment 1 of the ADR) are written. Data, `tools/validate` and the golden tests are not started.
  The color mechanism exists, but no color value is stored until Phase 3, so "Liturgical color per
  day" stays unchecked. The exit criteria are not yet evaluated.
- Baseline: the General Roman Calendar as printed in the Missale Romanum, editio typica tertia
  (2002). Decrees after 2002 are deferred until after the MVP (maintainer decision,
  2026-11-04). Golden years 2016, 2024 and 2026 will therefore carry decree-affected days as
  known differences, and the exit criterion above is recorded as **met except decree-affected
  days**, not as met. See [ADR-0003](adr/0003-general-roman-calendar-and-precedence.md).
- No open question remains in ADR-0003. Several rules are accepted by the
  maintainer from a secondary source (romcal) or by decision and stay UNVERIFIED: St Joseph and the
  Annunciation around Easter (R21, R22), the Immaculate Heart with another memorial (R25), and the
  colors of Holy Saturday and Holy Thursday (R24, R26). Color is stored explicitly per entry.

### M3: Indonesian calendar and locale

Scope: `id` proprium and the i18n layer.

- [ ] `calendars/id.json` extending `general` with patches (add, replace, remove, re-rank)
- [ ] Regional settings for Indonesia verified against KWI documents
- [ ] `packages/i18n`: `localize()` with fallback chain
- [ ] `locales/id`: celebration names and UI labels
- [ ] CI check: every calendar ID has a translation key; no broken placeholders
- [ ] Decision on KWI permission recorded (or names authored by the project)

Exit criteria:

- Calendars for 2026 and 2027 match the KWI ordo on every day for id, rank and color.
- A translation-only PR does not need to touch `calendars/`.

### M4: Web app and exports (release v0.1)

Scope: the first usable product.

- [ ] `apps/web` on React Router v8: year, month and day views
- [ ] Calendar and locale selection (locale cookie, `Accept-Language` only as default)
- [ ] Resource routes for JSON and ICS
- [ ] `packages/export` with ICS and JSON writers
- [ ] Print-friendly styles, WCAG 2.2 AA checks, `hreflang` and canonical tags
- [ ] Static prerender for popular years; deployment target decided
- [ ] Release notes and `v0.1` tag

Exit criteria:

- ICS imports cleanly into common calendar clients.
- Lighthouse accessibility score and manual keyboard test pass for the three views.

### M5: Readings references (v0.2)

- [ ] Data model for readings as references only (no scripture text)
- [ ] Sunday and weekday cycle mapping
- [ ] Decision on lectionary text licensing recorded in an ADR
- [ ] Display references in the web app and exports

### M6: Diocesan calendars and PDF (v0.3)

- [ ] Diocese and order layers via `extends`
- [ ] Contribution guide for diocesan data
- [ ] Printable ordo (PDF)

### M7: More countries and public API (v1.0)

- [ ] Additional locales (starting with `en`) and national calendars
- [ ] API versioning and compatibility policy
- [ ] Documentation site

## 10. Success metrics

| Metric                                                        | Target                           |
| ------------------------------------------------------------- | -------------------------------- |
| Days differing from the reference in sampled years            | 0                                |
| Days differing from the KWI ordo (2026, 2027) at M3           | 0                                |
| Runtime dependencies in `@ordo/core`                          | 0                                |
| Time to generate one year (typical laptop)                    | well under 100 ms (to validate)  |
| Translation or data PRs that pass CI without maintainer fixes | trending up                      |
| External contributors with a merged PR (after v0.1)           | at least 3 in the first 6 months |

## 11. Risks and mitigations

| Risk                                                              | Mitigation                                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Permission to use KWI names and texts is not granted              | Facts-only data, names authored by us, decision recorded in an ADR     |
| Precedence and transfer rules are subtle and easy to get wrong    | Golden tests on hard years, one test per rule, review by a liturgist   |
| Data entered from memory or unofficial sources                    | Per-file source field, `AGENTS.md` rule, review checklist              |
| Calendar editions change (new celebrations added by the Holy See) | `edition` and `validFrom` on each calendar                             |
| Reference calendar disagrees with the official ordo               | Official publication wins; document discrepancies in the test fixtures |
| Tooling churn (Bun, TypeScript, React Router major versions)      | Pin versions, upgrade in dedicated PRs                                 |
| Scope creep into readings and full liturgical texts               | Keep them in M5 and out of v0.1; references only                       |

## 12. Open questions

1. Resolved for M1 by [ADR-0002](adr/0002-reference-sources-for-golden-tests.md)
   (GCatholic.org and Avitalia as secondary references, facts-only fixtures). Still open:
   the reference for M2 (rank and color per day) and for years outside 2024-2029.
2. What are the correct regional settings for Indonesia (Epiphany, Ascension, Corpus Christi,
   holy days of obligation)? The references show Epiphany on Sunday, Ascension on Thursday and
   Corpus Christi on Sunday for 2024-2029, but this must be verified from KWI documents. The
   holy days of obligation are not stated by either source. The maintainer recalls that
   Indonesia follows the Vatican for Epiphany; the references show a Sunday Epiphany every
   year from 2024 to 2029 instead, so this conflict must be settled from a KWI document.
3. Will KWI grant permission for names and texts, and who is the contact?
4. Which dioceses and orders come first in M6?
5. Where is the web app hosted, and who maintains it?
6. Text licensing for readings (for example Indonesian Bible translations) before M5.
7. Do we want the psalter week (I-IV) of the Liturgy of the Hours? The reference calendars
   print it next to many days, and it is a pure function of the season and week.

## 13. Glossary

- **Ordo**: the annual directory of the liturgical calendar.
- **Proprium**: the celebrations specific to a country, diocese or order.
- **Precedence**: the ranking that decides which celebration wins when several fall on the
  same day.
- **Solemnity, feast, memorial, optional memorial**: ranks of celebrations.
- **KWI**: the Indonesian Bishops' Conference (Konferensi Waligereja Indonesia).
- **Golden test**: a test comparing output with a fixed, trusted reference.
