# AGENTS.md

Instructions for AI coding agents (and a useful briefing for human contributors) working in
this repository. `CLAUDE.md` and `GEMINI.md` simply point here, so keep this file as the
single source of truth.

## Project

Ordo is an open source generator for the Catholic liturgical calendar. Every movable day is
derived from the date of Easter; the rest is fixed-date celebration data plus precedence
rules. Product requirements and milestones live in [`docs/PRD.md`](docs/PRD.md): check it
before starting work, and update the milestone checklist and status in the same commit that
completes an item. Design decisions live in [`docs/adr`](docs/adr). Read ADR-0001 before
making architectural changes, and add a new ADR when you change a decision.

Repository: `paroki/ordo`. Web app: React Router v8 (not created yet, planned in `apps/web`).

## Language

- **Everything is written in English**: code, identifiers, comments, error messages, test
  names, commit messages, PR descriptions and documentation. The project is meant to be
  contributed to from any country.
- The only place other languages appear is locale data files (`packages/data/locales/<locale>/`)
  holding translations of user-facing content.
- Liturgical terms: use the English name in code and docs (e.g. `solemnity`, `memorial`,
  `Ordinary Time`) and keep the Latin or local name in locale data.

## Commands

Runtime and package manager is **Bun** (version pinned in `.bun-version`). Do not use npm,
yarn or pnpm, and do not commit their lockfiles.

```sh
bun install
bun run check       # lint + typecheck + test (run before every commit)
bun run test        # bun test
bun run typecheck
bun run lint        # Biome check
bun run format      # Biome check --write
```

## Layout

```
packages/core     computus, seasons, precedence resolver (pure TypeScript)
packages/data     calendars/*.json, locales/*/*.json        (planned)
packages/i18n     localize() + fallback chain               (planned)
packages/export   ICS, JSON                                 (planned)
apps/web          React Router v8                           (planned)
tools/validate    schema and translation checks in CI       (planned)
docs/adr          architecture decision records
```

## Architecture rules

1. **Three separate axes**: calendar (country/region), locale (language), lectionary
   (readings). Never mix them (for example, never derive a calendar from a language).
2. **`@ordo/core` is pure.** No I/O, no randomness, no global state, no runtime
   dependencies, and it never returns display strings. It returns stable IDs (slugs),
   ranks, colors and seasons.
3. **Dates are `IsoDate` strings (`YYYY-MM-DD`)**, date-only and UTC. Never use local-time
   `new Date()` for calendar logic. Use the helpers in `packages/core/src/date.ts`.
4. **Data-driven.** Celebrations, regional settings and propria live in JSON data, not in
   code. Regional differences (Ascension on Thursday or Sunday, Epiphany, Corpus Christi,
   holy days of obligation) are configuration, not branches in algorithms.
5. **Celebration IDs are stable slugs** (e.g. `immaculate-conception`). Translations,
   patches and overrides refer to IDs, never to names.
6. **Calendars layer via `extends`**: General Roman Calendar, then national proprium, then
   diocese or order. A layer can add, replace, remove or re-rank entries.
7. Translation changes must never require touching `calendars/`, and a new calendar must
   not require a complete translation set (locales fall back along a chain).

## Liturgical accuracy

This project produces data people will rely on for worship planning.

- **Never write calendar facts from memory.** Dates, ranks, colors and proprium entries must
  come from an authoritative source (General Roman Calendar, the Universal Norms on the
  Liturgical Year and the General Roman Calendar, or the national bishops' conference). Record
  the source for each data file or entry.
- For Indonesia the reference source is KWI. Permission to use KWI texts and names is not
  settled (see ADR-0001), so data files contain only facts (date, rank, id); names are
  written by us.
- Behavior must be verified with golden tests against an official or independent reference
  calendar (for example sampled years such as 2008, 2016, 2024, 2026) plus property tests
  (for example: Easter is always a Sunday between 22 March and 25 April).
- Reference fixtures (`*.fixtures.ts`) store facts only (dates, seasons, week numbers, ranks),
  never names or texts copied from a source, and record the source of every year. Which
  sources are accepted, and their limits, is in [ADR-0002](docs/adr/0002-reference-sources-for-golden-tests.md).
- If a rule is ambiguous, stop and document the question in an ADR or issue instead of
  guessing.

## Code conventions

- TypeScript with `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
  Do not use `any`; do not suppress type errors without a comment explaining why.
- Formatting and linting are enforced by Biome (2-space indent, double quotes, line width
  100). Run `bun run format` instead of hand-formatting.
- Keep functions small and pure; prefer data tables over long conditionals.
- Tests live next to the code as `*.test.ts` and use `bun:test`.
- Write a failing test first for new behavior and bug fixes.
- Do not add runtime dependencies to `packages/core`. Validation libraries such as zod
  belong in `tools/validate`, not in `core`.

## Git

Commit messages follow Conventional Commits with a mandatory emoji, written in English:

```
type: <emoji> message
```

Rules:

- `type` is lowercase and comes from the table below. No scope.
- One space after the colon, then the emoji of that type, one space, then the message.
- The message is imperative, starts lowercase, and has no trailing period.
- Breaking change: add `!` after the type (`feat!: ✨ ...`) and a `BREAKING CHANGE:` footer.

| Type       | Emoji | Use for                                                 |
| ---------- | ----- | ------------------------------------------------------- |
| `feat`     | ✨    | a new feature                                           |
| `fix`      | 🐛    | a bug fix                                               |
| `docs`     | 📝    | documentation only (README, ADR, AGENTS.md)             |
| `style`    | 💄    | formatting only, no logic change                        |
| `refactor` | ♻️    | code change that neither fixes a bug nor adds a feature |
| `perf`     | ⚡️    | performance improvement                                 |
| `test`     | ✅    | adding or fixing tests                                  |
| `build`    | 📦    | build system and dependencies                           |
| `ci`       | 👷    | CI configuration                                        |
| `chore`    | 🔧    | maintenance that fits no other type                     |
| `data`     | 📅    | calendar or celebration data                            |
| `i18n`     | 🌐    | translations and locale data                            |
| `revert`   | ⏪    | reverting a previous commit                             |
| `init`     | 🎉    | the repository's initial commit only                    |

Examples:

```
feat: ✨ add liturgical season resolver
fix: 🐛 handle Epiphany on 7 January
data: 📅 add Indonesian proprium memorials
i18n: 🌐 translate general calendar names to Indonesian
```

Other rules:

- Keep commits focused. Do not mix formatting-only changes with logic changes.
- `bun run check` must pass before committing; CI runs the same checks.
- Do not commit secrets, `.env` files or generated build output.

## Do not

- Change the license or the copyright holder line in `LICENSE` (MIT, 2026-present Paroki
  Developers) without an explicit maintainer decision.
- Copy text from the Roman Missal, Lectionary or national proprium books into the repository.
- Add display strings to `@ordo/core`.
- Change a public API of `@ordo/core` without updating the README example and tests.
