# Almanac Data Notes

This engine treats the provided reference almanac as the source of truth.

## Current Solar Term Data

`src/solarTerms.ts` currently contains month-start solar terms for:

- 1997
- 1998
- 1999
- 2000
- 2001
- 2002

Source image:

- `drive-pdfs/113-images/page-09-Im9.png`: 1997 and 1998
- `drive-pdfs/113-images/page-10-Im10.png`: 1999 and 2000
- `drive-pdfs/113-images/page-11-Im11.png`: 2001 and 2002

The PDF/image files are ignored by git through `.gitignore`.

## Data Format

The data is keyed by year and month branch.

```ts
2000: {
  寅: term(2, 4, 21, 42),
  巳: term(5, 5, 13, 51)
}
```

This means:

- `寅`: February month starts at 2000-02-04 21:42
- `巳`: May month starts at 2000-05-05 13:51

The engine uses these exact times for:

- year pillar switching at `寅` / 立春
- month pillar switching at each branch's solar term start

When a year is not present in `src/solarTerms.ts`, the engine falls back to approximate fixed dates at 00:00. That fallback is only for development; production-grade matching should add the target year from the almanac.

## Input Helper

Use `data/solar-term-input.example.json` as the input template. Checked transcriptions already added to the engine are kept in `data/solar-term-input.checked.json`.

```json
{
  "years": {
    "2000": {
      "1": "5-15:52",
      "2": "4-21:42"
    }
  }
}
```

Each key is the calendar month column in the almanac:

- `1` -> 丑
- `2` -> 寅
- `3` -> 卯
- `4` -> 辰
- `5` -> 巳
- `6` -> 午
- `7` -> 未
- `8` -> 申
- `9` -> 酉
- `10` -> 戌
- `11` -> 亥
- `12` -> 子

Each value is `day-hour:minute`.

Run:

```powershell
npm.cmd run format:solar-terms -- data\solar-term-input.example.json
```

The command prints a paste-ready TypeScript block for `src/solarTerms.ts`.

## Luck Start Calculation

The engine calculates the first major-luck start age from the surrounding solar term.

- male + yang year stem: forward
- female + yin year stem: forward
- male + yin year stem: backward
- female + yang year stem: backward

Forward luck uses the next solar term. Backward luck uses the previous solar term.

The age conversion is:

```text
round(days to reference solar term / 3)
```

This matches the current checked cases:

- 2000-05-08 15:54 male, 庚 year: first switch at 9
- 1971-07-01 05:13 female, 辛 year: first switch at 2

## Course Notes Reflected in the Engine

The `講座` Google Drive folder currently confirms these implementation rules:

- major luck direction is determined from gender and the year-stem polarity
- major luck starts from the month pillar and moves forward or backward
- first luck age is based on days to the next or previous solar term divided by 3
- yearly `地の流れ` uses the year stem polarity and the chart's void branches

For `地の流れ`, the engine now returns the 60-ganzhi cycle anchored at the void-branch ganzhi whose stem has the same polarity as the basis stem.

Example for the Fujiwara reference chart:

- year stem: `庚` / yang
- void: `戌亥`
- anchor: `甲戌`
- cycle start: `甲戌`, `乙亥`, `丙子`, `丁丑`...

The course material also includes state labels such as 無効, リセット, 開花, 成長, 決定, 病気, 人気, 浮気, 再開, 経済, 充実, and 裏切り. Their exact order still needs a checked reference case before being hard-coded.

## Power Score

`src/power.ts` implements the course-style power score currently verified by two image cases.

Rules used in v1:

- score each visible heavenly stem in the four pillars: 自星 and 印星 are `+1`, all other stars are `-1`
- score each pillar's adopted hidden stem
- score the month-branch active hidden stem as the center star with multiplier `3`
- classify totals as:
  - `身強`: `+3` or above
  - `身弱`: `-4` or below
  - `中庸`: otherwise

Checked cases:

- 2000-05-08 15:54 male: `-2` by reference override; full hidden-stem rule gives `-4`
- 1971-07-01 05:13 female: `+4` by reference override; full hidden-stem rule gives `+2`
- 1969-03-23 male, time unknown: `+2`
- 1997-06-21 02:40 female: `-6`
- 1998-08-18 11:18 female: `-2`

## Guardian Deity

`src/guardian.ts` implements guardian deities as a table keyed by `day stem : month branch`.

The table now contains all `10 x 12 = 120` day-stem/month-branch pairs transcribed from the supplied almanac images.

Source precedence:

- exact checked reference charts
- explicit course examples
- transcribed almanac table

- `丙:巳` -> `乙`, `庚` (Fujiwara reference chart)
- `丁:午` -> `壬`, `庚` (1971 reference image)
- `丁:未` -> `甲`, `庚`, `壬` (course example)
- `壬:申` -> `戊`, `丁` (course example)

The next step for production matching is to verify the manual transcription against more completed chart images.

## Chart CLI

Run a chart from the command line:

```powershell
npm.cmd run chart -- 2000-05-08 15:54 male 133.93
```

Arguments:

- `birthDate`: `YYYY-MM-DD`
- `birthTime`: `HH:mm`
- `gender`: `male`, `female`, `男`, `女`, `男性`, or `女性`
- `longitude`: decimal longitude
- `--no-correction`: optional flag to disable longitude correction

Example without correction:

```powershell
npm.cmd run chart -- 1971-07-01 05:13 女性 135 --no-correction
```
