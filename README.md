# Ordo

An open source generator for the Catholic liturgical calendar.

> Status: **M1 done**. Liturgical seasons, movable days and lectionary cycles are
> available and checked against reference calendars for 2024, 2026 and 2027. Celebrations
> (saints, solemnities, precedence) are not implemented yet.

## Principles

- Every movable day is derived from the date of Easter.
- `@ordo/core` contains pure functions, has no runtime dependencies, and never returns display strings.
- Calendar (country), language and readings are three separate concerns.

Product requirements and the milestone roadmap are in [docs/PRD.md](docs/PRD.md). Design
decisions are recorded in [docs/adr](docs/adr).

## Development

Requires [Bun](https://bun.sh) (version pinned in `.bun-version`).

```sh
bun install
bun run check   # lint + typecheck + test
```

## Example

```ts
import { easter, getAnchors, getLiturgicalTime } from "@ordo/core";

easter(2026); // "2026-04-05"

getAnchors(2026).pentecost; // "2026-05-24"

getLiturgicalTime("2026-05-25");
// { season: "ordinary-time", week: 8, holyWeek: false, date: "2026-05-25",
//   weekday: 1, sundayCycle: "A", weekdayCycle: "II" }

// Regional options (defaults follow the General Roman Calendar)
getAnchors(2026, { ascension: "sunday" }).ascension; // "2026-05-17"
```

Weeks are numbered by the most recent Sunday of the season. The Christmas season and the
Triduum have no week number.

## Contributing

All code, comments, commit messages and documentation are written in English. See
[AGENTS.md](AGENTS.md) for conventions (they apply to human contributors too).

## License

[MIT](LICENSE) © 2026-present Paroki Developers.
