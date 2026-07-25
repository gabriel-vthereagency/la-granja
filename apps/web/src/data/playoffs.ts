/**
 * Fraca winners, keyed by season name.
 *
 * The Fraca has never been recorded in the database — `hall_of_fame` only holds
 * `final_seven` rows and `offline_events` is empty. Rather than start a registry
 * with a single entry, the current winner lives here as one editable line.
 *
 * Add an entry when a season's Fraca is played. Backfilling the historical Fraca
 * winners into the database is a separate decision.
 */
export const FRACA_WINNERS: Record<string, string> = {
  'Apertura 2026': 'rasta',
}

export function getFracaWinner(seasonName: string | null | undefined): string | null {
  if (!seasonName) return null
  return FRACA_WINNERS[seasonName] ?? null
}
