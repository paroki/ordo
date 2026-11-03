# Ordo

An open source generator for the Catholic liturgical calendar.

> Status: **M0** (skeleton). Nothing can be generated yet except the date of Easter.

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
import { easter } from "@ordo/core";

easter(2026); // "2026-04-05"
```

## Contributing

All code, comments, commit messages and documentation are written in English. See
[AGENTS.md](AGENTS.md) for conventions (they apply to human contributors too).

## License

[MIT](LICENSE) © 2026-present Paroki Developers.
