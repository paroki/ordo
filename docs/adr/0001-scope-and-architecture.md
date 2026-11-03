# ADR-0001: Initial scope and architecture

- Status: accepted
- Date: 2026-11-03

## Context

Ordo is an open source generator for the Catholic liturgical calendar. The liturgical
calendar is mostly deterministic: every movable day is derived from the date of Easter,
and the rest is fixed-date celebration data plus precedence rules. The application must
be able to support multiple countries and languages in the future, but v1 is deliberately
small.

## Decision

### 1. Three separate axes

| Axis       | Question                         | Lives in                        |
| ---------- | -------------------------------- | ------------------------------- |
| Calendar   | What is celebrated, and when?    | `core` + calendar data          |
| Locale     | In which language is it written? | translation data + i18n package |
| Lectionary | Which scripture text version?    | separate module (own licensing) |

`core` never returns display strings. It only returns stable IDs (slugs), ranks, colors
and seasons.

### 2. v1 scope

- Locale: `id` only. The i18n structure is prepared from the start.
- Calendars: `general` (General Roman Calendar) and `id` (Indonesian proprium, based on
  KWI, extending `general`).
- Daily readings: on the roadmap (v0.3 and later), not started.
- Reference source for the Indonesian calendar data: KWI (Indonesian Bishops' Conference).
- Out of scope for v1: Extraordinary Form (1962), Eastern/Ambrosian rites, diocesan calendars.

### 3. Technology

- Runtime and package manager: **Bun** (workspaces).
- Language: strict TypeScript.
- Web app: React Router v8 (in `apps/web`, not created yet).
- Lint and format: Biome. Tests: `bun test`.
- `packages/core`: zero runtime dependencies, pure functions, dates as ISO strings
  `YYYY-MM-DD` (date-only, UTC), no local-time `Date` usage.
- All code, comments, identifiers, error messages, commit messages and documentation are
  written in English so that contributors from any country can participate. Translations
  of user-facing content live only in locale data files.

### 4. Repository layout

```
packages/core     computus, seasons, precedence resolver
packages/data     calendars/*.json, locales/*/*.json   (M2-M3)
packages/i18n     localize() + fallback chain          (M3)
packages/export   ICS, JSON                            (M4)
apps/web          React Router v8                      (M4)
tools/validate    schema and translation checks in CI  (M2)
```

### 5. License

The repository is licensed under the MIT License, copyright 2026-present Paroki Developers
(see `LICENSE`). Material obtained from third parties (for example texts or names from KWI)
is not covered by this decision and needs its own permission, see below.

## Open (undecided)

1. **KWI permission** to use proprium names and texts. Until permission is granted, data
   contains only facts (date, rank, id) and names are written by us.

## Consequences

- Adding a new language does not touch calendar data.
- Adding a new country does not require a complete translation set.
- Results do not depend on the machine's timezone.
