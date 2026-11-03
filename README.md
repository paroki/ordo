# Ordo

Generator kalender liturgi Katolik, open source.

> Status: **M0** (skeleton). Belum ada kalender yang bisa digenerate selain tanggal Paskah.

## Prinsip

- Semua hari bergerak diturunkan dari tanggal Paskah.
- `@ordo/core` berisi pure functions, tanpa dependency runtime, dan tidak mengembalikan string tampilan.
- Kalender (negara), bahasa, dan bacaan adalah tiga hal yang terpisah.

Detail keputusan ada di [docs/adr](docs/adr).

## Pengembangan

Butuh [Bun](https://bun.sh) (versi di `.bun-version`).

```sh
bun install
bun run check   # lint + typecheck + test
```

## Contoh

```ts
import { easter } from "@ordo/core";

easter(2026); // "2026-04-05"
```

## Lisensi

Belum ditentukan, lihat bagian "Terbuka" di ADR-0001.
