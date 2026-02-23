/**
 * Historical Final Seven and Summer Cup results data.
 * Source: "final7 y summer.xls" (official records)
 *
 * playerKey maps to photo file: /Players/{playerKey}.png
 * Players without a photo file will show the monkey fallback.
 */

export interface FinalResult {
  position: number
  name: string
  playerKey: string
}

export interface FinalData {
  year: number
  type: 'apertura' | 'clausura' | 'summer'
  results: FinalResult[]
}

// ─── Final Seven Results ──────────────────────────────────────────

export const FINAL_SEVEN_DATA: FinalData[] = [
  {
    year: 2016, type: 'apertura',
    results: [
      { position: 1, name: 'Santini', playerKey: 'santini' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Charly', playerKey: 'charly' },
      { position: 4, name: 'Araña', playerKey: 'arana' },
      { position: 5, name: 'Lucas', playerKey: 'lucas' },
      { position: 6, name: 'Pedro', playerKey: 'pedro' },
    ],
  },
  {
    year: 2016, type: 'clausura',
    results: [
      { position: 1, name: 'Simón', playerKey: 'simon' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Ari', playerKey: 'ari' },
      { position: 4, name: 'Martín', playerKey: 'martin' },
      { position: 5, name: 'Lucas', playerKey: 'lucas' },
      { position: 6, name: 'Charly', playerKey: 'charly' },
    ],
  },
  {
    year: 2017, type: 'apertura',
    results: [
      { position: 1, name: 'Mich', playerKey: 'mich' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Santini', playerKey: 'santini' },
      { position: 4, name: 'Araña', playerKey: 'arana' },
      { position: 5, name: 'Halcón', playerKey: 'halcon' },
      { position: 6, name: 'Alvarito', playerKey: 'alvarito' },
      { position: 7, name: 'FFF', playerKey: 'fff' },
    ],
  },
  {
    year: 2017, type: 'clausura',
    results: [
      { position: 1, name: 'Halcón', playerKey: 'halcon' },
      { position: 2, name: 'Charly', playerKey: 'charly' },
      { position: 3, name: 'Mich', playerKey: 'mich' },
      { position: 4, name: 'Gabo', playerKey: 'gabo' },
      { position: 5, name: 'Lucas', playerKey: 'lucas' },
      { position: 6, name: 'Rasta', playerKey: 'rasta' },
      { position: 7, name: 'Alvarito', playerKey: 'alvarito' },
    ],
  },
  {
    year: 2018, type: 'apertura',
    results: [
      { position: 1, name: 'Mich', playerKey: 'mich' },
      { position: 2, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 3, name: 'Araña', playerKey: 'arana' },
      { position: 4, name: 'Ari', playerKey: 'ari' },
      { position: 5, name: 'Simón', playerKey: 'simon' },
      { position: 6, name: 'Martín', playerKey: 'martin' },
      { position: 7, name: 'Santini', playerKey: 'santini' },
      { position: 8, name: 'Alvarito', playerKey: 'alvarito' },
    ],
  },
  {
    year: 2018, type: 'clausura',
    results: [
      { position: 1, name: 'Ari', playerKey: 'ari' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 4, name: 'Lucas', playerKey: 'lucas' },
      { position: 5, name: 'Martín', playerKey: 'martin' },
      { position: 6, name: 'Sergio', playerKey: 'sergio' },
      { position: 7, name: 'FFF', playerKey: 'fff' },
      { position: 8, name: 'Araña', playerKey: 'arana' },
    ],
  },
  {
    year: 2019, type: 'apertura',
    results: [
      { position: 1, name: 'Gabo', playerKey: 'gabo' },
      { position: 2, name: 'Araña', playerKey: 'arana' },
      { position: 3, name: 'Lucas', playerKey: 'lucas' },
      { position: 4, name: 'Ari', playerKey: 'ari' },
      { position: 5, name: 'Alan', playerKey: 'alan' },
      { position: 6, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 7, name: 'Rasta', playerKey: 'rasta' },
      { position: 8, name: 'Charly', playerKey: 'charly' },
    ],
  },
  {
    year: 2019, type: 'clausura',
    results: [
      { position: 1, name: 'Gabo', playerKey: 'gabo' },
      { position: 2, name: 'Santini', playerKey: 'santini' },
      { position: 3, name: 'Martín', playerKey: 'martin' },
      { position: 4, name: 'Charly', playerKey: 'charly' },
      { position: 5, name: 'Mich', playerKey: 'mich' },
      { position: 6, name: 'Rasta', playerKey: 'rasta' },
      { position: 7, name: 'Lucas', playerKey: 'lucas' },
      { position: 8, name: 'Araña', playerKey: 'arana' },
    ],
  },
  {
    year: 2020, type: 'apertura',
    results: [
      { position: 1, name: 'Mich', playerKey: 'mich' },
      { position: 2, name: 'Martín', playerKey: 'martin' },
      { position: 3, name: 'Araña', playerKey: 'arana' },
      { position: 4, name: 'Sherley', playerKey: 'sherley' },
      { position: 5, name: 'Gabo', playerKey: 'gabo' },
      { position: 6, name: 'FFF', playerKey: 'fff' },
      { position: 7, name: 'Charly', playerKey: 'charly' },
      { position: 8, name: 'Alan', playerKey: 'alan' },
    ],
  },
  {
    year: 2020, type: 'clausura',
    results: [
      { position: 1, name: 'Santini', playerKey: 'santini' },
      { position: 2, name: 'Rasta', playerKey: 'rasta' },
      { position: 3, name: 'Santi', playerKey: 'santi' },
      { position: 4, name: 'Ari', playerKey: 'ari' },
      { position: 5, name: 'Tempone', playerKey: 'tempo' },
      { position: 6, name: 'Halcón', playerKey: 'halcon' },
      { position: 7, name: 'Gabo', playerKey: 'gabo' },
      { position: 8, name: 'FFF', playerKey: 'fff' },
    ],
  },
  {
    year: 2021, type: 'apertura',
    results: [
      { position: 1, name: 'Santi', playerKey: 'santi' },
      { position: 2, name: 'Mich', playerKey: 'mich' },
      { position: 3, name: 'Gabo', playerKey: 'gabo' },
      { position: 4, name: 'Rasta', playerKey: 'rasta' },
      { position: 5, name: 'Santini', playerKey: 'santini' },
      { position: 6, name: 'Halcón', playerKey: 'halcon' },
      { position: 7, name: 'Araña', playerKey: 'arana' },
      { position: 8, name: 'Martín', playerKey: 'martin' },
    ],
  },
  {
    year: 2021, type: 'clausura',
    results: [
      { position: 1, name: 'Alan', playerKey: 'alan' },
      { position: 2, name: 'Santini', playerKey: 'santini' },
      { position: 3, name: 'Gabo', playerKey: 'gabo' },
      { position: 4, name: 'FFF', playerKey: 'fff' },
      { position: 5, name: 'Pep', playerKey: 'pep' },
      { position: 6, name: 'Mich', playerKey: 'mich' },
      { position: 7, name: 'Araña', playerKey: 'arana' },
      { position: 8, name: 'Santi', playerKey: 'santi' },
    ],
  },
  {
    year: 2022, type: 'apertura',
    results: [
      { position: 1, name: 'Araña', playerKey: 'arana' },
      { position: 2, name: 'Toti', playerKey: 'toti' },
      { position: 3, name: 'Oscar', playerKey: 'oscar' },
      { position: 4, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 5, name: 'Halcón', playerKey: 'halcon' },
      { position: 6, name: 'Ova', playerKey: 'ova' },
      { position: 7, name: 'Guille', playerKey: 'guille' },
      { position: 8, name: 'Santi', playerKey: 'santi' },
    ],
  },
  {
    year: 2022, type: 'clausura',
    results: [
      { position: 1, name: 'FFF', playerKey: 'fff' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Rasta', playerKey: 'rasta' },
      { position: 4, name: 'Nacho', playerKey: 'nacho' },
      { position: 5, name: 'Yeti', playerKey: 'yeti' },
      { position: 6, name: 'Oscar', playerKey: 'oscar' },
      { position: 7, name: 'Mich', playerKey: 'mich' },
      { position: 8, name: 'Bochy', playerKey: 'bochy' },
    ],
  },
  {
    year: 2023, type: 'apertura',
    results: [
      { position: 1, name: 'Bochy', playerKey: 'bochy' },
      { position: 2, name: 'Toti', playerKey: 'toti' },
      { position: 3, name: 'Shark', playerKey: 'shark' },
      { position: 4, name: 'Gabo', playerKey: 'gabo' },
      { position: 5, name: 'Lean', playerKey: 'lean' },
      { position: 6, name: 'Santi', playerKey: 'santi' },
      { position: 7, name: 'Cachavacha', playerKey: 'cachavacha' },
      { position: 8, name: 'Woody', playerKey: 'woody' },
    ],
  },
  {
    year: 2023, type: 'clausura',
    results: [
      { position: 1, name: 'Mich', playerKey: 'mich' },
      { position: 2, name: 'Guille', playerKey: 'guille' },
      { position: 3, name: 'Nato', playerKey: 'nato' },
      { position: 4, name: 'Rasta', playerKey: 'rasta' },
      { position: 5, name: 'Araña', playerKey: 'arana' },
      { position: 6, name: 'Ari', playerKey: 'ari' },
      { position: 7, name: 'Tala', playerKey: 'tala' },
      { position: 8, name: 'Santi', playerKey: 'santi' },
    ],
  },
  {
    year: 2024, type: 'apertura',
    results: [
      { position: 1, name: 'Shark', playerKey: 'shark' },
      { position: 2, name: 'Mich', playerKey: 'mich' },
      { position: 3, name: 'Gabo', playerKey: 'gabo' },
      { position: 4, name: 'Galle', playerKey: 'galle' },
      { position: 5, name: 'Ari', playerKey: 'ari' },
      { position: 6, name: 'Woody', playerKey: 'woody' },
      { position: 7, name: 'Yeti', playerKey: 'yeti' },
      { position: 8, name: 'Gonza', playerKey: 'gonza' },
    ],
  },
  {
    year: 2024, type: 'clausura',
    results: [
      { position: 1, name: 'Pep', playerKey: 'pep' },
      { position: 2, name: 'Tala', playerKey: 'tala' },
      { position: 3, name: 'Shark', playerKey: 'shark' },
      { position: 4, name: 'Galle', playerKey: 'galle' },
      { position: 5, name: 'Yamo', playerKey: 'yamo' },
      { position: 6, name: 'Lean', playerKey: 'lean' },
      { position: 7, name: 'Araña', playerKey: 'arana' },
      { position: 8, name: 'Ari', playerKey: 'ari' },
    ],
  },
  {
    year: 2025, type: 'apertura',
    results: [
      { position: 1, name: 'Shark', playerKey: 'shark' },
      { position: 2, name: 'Nato', playerKey: 'nato' },
      { position: 3, name: 'Ari', playerKey: 'ari' },
      { position: 4, name: 'Cachi', playerKey: 'cachi' },
      { position: 5, name: 'Tala', playerKey: 'tala' },
      { position: 6, name: 'Gabo', playerKey: 'gabo' },
      { position: 7, name: 'Lean', playerKey: 'lean' },
      { position: 8, name: 'Galle', playerKey: 'galle' },
    ],
  },
  {
    year: 2025, type: 'clausura',
    results: [
      { position: 1, name: 'Rasta', playerKey: 'rasta' },
      { position: 2, name: 'Shark', playerKey: 'shark' },
      { position: 3, name: 'Cachi', playerKey: 'cachi' },
      { position: 4, name: 'Galle', playerKey: 'galle' },
      { position: 5, name: 'Tala', playerKey: 'tala' },
      { position: 6, name: 'Ari', playerKey: 'ari' },
      { position: 7, name: 'Nato', playerKey: 'nato' },
      { position: 8, name: 'Araña', playerKey: 'arana' },
    ],
  },
]

// ─── Summer Cup Results (Top 5) ─────────────────────────────────

export const SUMMER_DATA: FinalData[] = [
  {
    year: 2018, type: 'summer',
    results: [
      { position: 1, name: 'Mich', playerKey: 'mich' },
      { position: 2, name: 'Gabo', playerKey: 'gabo' },
      { position: 3, name: 'Araña', playerKey: 'arana' },
      { position: 4, name: 'Santini', playerKey: 'santini' },
      { position: 5, name: 'Rasta', playerKey: 'rasta' },
    ],
  },
  {
    year: 2019, type: 'summer',
    results: [
      { position: 1, name: 'Oscar', playerKey: 'oscar' },
      { position: 2, name: 'Mich', playerKey: 'mich' },
      { position: 3, name: 'Ale', playerKey: 'ale' },
      { position: 4, name: 'Pancho', playerKey: 'pancho' },
      { position: 5, name: 'Sherley', playerKey: 'sherley' },
    ],
  },
  {
    year: 2020, type: 'summer',
    results: [
      { position: 1, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 2, name: 'Mich', playerKey: 'mich' },
      { position: 3, name: 'Ari', playerKey: 'ari' },
      { position: 4, name: 'Rasta', playerKey: 'rasta' },
      { position: 5, name: 'Sherley', playerKey: 'sherley' },
    ],
  },
  {
    year: 2021, type: 'summer',
    results: [
      { position: 1, name: 'Simón & Araña', playerKey: 'simon' },
      { position: 2, name: 'FFF', playerKey: 'fff' },
      { position: 3, name: 'Santi', playerKey: 'santi' },
      { position: 4, name: 'Gabo', playerKey: 'gabo' },
      { position: 5, name: 'Ari', playerKey: 'ari' },
    ],
  },
  {
    year: 2022, type: 'summer',
    results: [
      { position: 1, name: 'Gonzalo', playerKey: 'gonza' },
      { position: 2, name: 'Mich', playerKey: 'mich' },
      { position: 3, name: 'Hernán', playerKey: 'hernan' },
      { position: 4, name: 'Halcón', playerKey: 'halcon' },
      { position: 5, name: 'Gabo', playerKey: 'gabo' },
    ],
  },
  {
    year: 2023, type: 'summer',
    results: [
      { position: 1, name: 'Araña', playerKey: 'arana' },
      { position: 2, name: 'FFF', playerKey: 'fff' },
      { position: 3, name: 'Ari', playerKey: 'ari' },
      { position: 4, name: 'Mich', playerKey: 'mich' },
      { position: 5, name: 'Ova', playerKey: 'ova' },
    ],
  },
  {
    year: 2024, type: 'summer',
    results: [
      { position: 1, name: 'Gabo', playerKey: 'gabo' },
      { position: 2, name: 'Toti', playerKey: 'toti' },
      { position: 3, name: 'Shark', playerKey: 'shark' },
      { position: 4, name: 'Cachavacha', playerKey: 'cachavacha' },
      { position: 5, name: 'Araña', playerKey: 'arana' },
    ],
  },
  {
    year: 2025, type: 'summer',
    results: [
      { position: 1, name: 'Ari', playerKey: 'ari' },
      { position: 2, name: 'Pep', playerKey: 'pep' },
      { position: 3, name: 'Fechele', playerKey: 'fechele' },
      { position: 4, name: 'Woody', playerKey: 'woody' },
      { position: 5, name: 'Gabo', playerKey: 'gabo' },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────

/** Find final results matching a season by type and year */
export function getFinalForSeason(
  type: string,
  year: number,
): FinalData | undefined {
  if (type === 'summer') {
    return SUMMER_DATA.find((d) => d.year === year)
  }
  return FINAL_SEVEN_DATA.find((d) => d.year === year && d.type === type)
}

/** Top 10 players by number of Final Seven appearances */
export function getTopFinalClassifications(): {
  player: string
  playerKey: string
  count: number
}[] {
  const counts = new Map<string, { player: string; playerKey: string; count: number }>()

  for (const final of FINAL_SEVEN_DATA) {
    for (const r of final.results) {
      const existing = counts.get(r.playerKey)
      if (existing) {
        existing.count++
      } else {
        counts.set(r.playerKey, { player: r.name, playerKey: r.playerKey, count: 1 })
      }
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
