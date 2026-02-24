import type { LiveTournamentState } from '@lagranja/types'
import { TOURNAMENT_CONFIG } from '@lagranja/types'

export interface TournamentStats {
  playersRegistered: number
  playersActive: number
  playersEliminated: number
  totalRebuys: number
  totalChips: number
  averageStack: number
  prizePool: number // 100% de entradas + recompras
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

  // Pozo = 100% de (entradas + recompras) * valor de la caja
  const prizePool = (playersRegistered + totalRebuys) * state.buyInAmount

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
