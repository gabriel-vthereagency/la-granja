import type { LiveTournamentState } from '@lagranja/types'
import { TOURNAMENT_CONFIG, VENUE_PERCENTAGE, F7_PERCENTAGE } from '@lagranja/types'

export interface TournamentStats {
  playersRegistered: number
  playersActive: number
  playersEliminated: number
  totalRebuys: number
  totalChips: number
  averageStack: number
  prizePool: number // Pozo NETO (después de descontar 10% sede + 10% F7)
}

export function calculateTournamentStats(
  state: LiveTournamentState
): TournamentStats {
  const playersRegistered = state.players.length
  const playersActive = state.players.filter((p) => p.status === 'active').length
  const playersEliminated = state.players.filter((p) => p.status === 'eliminated').length
  const totalRebuys = state.totalRebuys

  // Fichas totales = (entradas + recompras) * stack inicial
  const totalChips = (playersRegistered + totalRebuys) * TOURNAMENT_CONFIG.startingStack

  // Pozo bruto = (entradas + recompras) * valor de la caja
  const grossPool = (playersRegistered + totalRebuys) * state.buyInAmount

  // Pozo neto = bruto - 10% sede - 10% F7 (lo que se reparte a jugadores)
  const deductions = (grossPool * (VENUE_PERCENTAGE + F7_PERCENTAGE)) / 100
  const prizePool = grossPool - deductions

  return {
    playersRegistered,
    playersActive,
    playersEliminated,
    totalRebuys,
    totalChips,
    averageStack: playersActive > 0 ? Math.round(totalChips / playersActive) : 0,
    prizePool,
  }
}
