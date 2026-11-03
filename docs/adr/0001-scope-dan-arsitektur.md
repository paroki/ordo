# ADR-0001: Scope awal dan arsitektur

- Status: diterima
- Tanggal: 2026-11-03

## Konteks

Ordo adalah generator kalender liturgi Katolik, open source. Kalender liturgi
sebagian besar deterministik: semua hari bergerak diturunkan dari tanggal Paskah,
sisanya adalah data hari raya tetap dan aturan prioritas. Aplikasi perlu bisa
dipakai untuk beberapa negara dan bahasa di kemudian hari, tetapi v1 sengaja kecil.

## Keputusan

### 1. Tiga sumbu yang dipisah

| Sumbu      | Pertanyaan                    | Tempat hidup                     |
| ---------- | ----------------------------- | -------------------------------- |
| Calendar   | Apa yang dirayakan dan kapan? | `core` + data kalender           |
| Locale     | Ditulis dalam bahasa apa?     | data terjemahan + paket i18n     |
| Lectionary | Teks bacaan versi apa?        | modul terpisah (lisensi berbeda) |

`core` tidak pernah mengembalikan string tampilan. Ia hanya mengembalikan ID
stabil (slug), rank, warna, dan musim.

### 2. Scope v1

- Locale: `id` saja. Struktur i18n tetap disiapkan dari awal.
- Calendar: `general` (Kalender Romawi Umum) dan `id` (proprium KWI, meng-extend `general`).
- Bacaan harian: masuk roadmap (v0.3 ke atas), belum dikerjakan.
- Sumber acuan data kalender Indonesia: KWI.
- Di luar scope v1: Extraordinary Form (1962), ritus Timur/Ambrosian, kalender keuskupan.

### 3. Teknologi

- Runtime dan package manager: **Bun** (workspaces).
- Bahasa: TypeScript strict.
- Aplikasi web: React Router v8 (di `apps/web`, belum dibuat).
- Lint dan format: Biome. Test: `bun test`.
- `packages/core`: zero dependency runtime, pure functions, tanggal berupa
  string ISO `YYYY-MM-DD` (date-only, UTC), tidak memakai `Date` lokal.

### 4. Struktur repo

```
packages/core     computus, musim, resolver prioritas
packages/data     calendars/*.json, locales/*/*.json   (M2-M3)
packages/i18n     localize() + fallback chain          (M3)
packages/export   ICS, JSON                            (M4)
apps/web          React Router v8                      (M4)
tools/validate    validasi skema dan terjemahan di CI  (M2)
```

## Terbuka (belum diputuskan)

1. **Lisensi.** Usulan: kode MIT, data dan terjemahan CC BY-SA, dijelaskan terpisah.
   Repo belum punya file LICENSE sampai ini diputuskan.
2. **Izin KWI** untuk memakai nama proprium dan teks. Sampai ada izin, data hanya
   memuat fakta (tanggal, rank, id) dan nama ditulis sendiri.

## Konsekuensi

- Menambah bahasa baru tidak menyentuh data kalender.
- Menambah negara baru tidak wajib punya terjemahan lengkap.
- Hasil perhitungan tidak bergantung pada timezone mesin.
