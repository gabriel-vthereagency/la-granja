import type { SeasonStanding } from '@lagranja/types'

export interface QualificationResult {
  directToFinal: string[] // Top 8 van directo
  toFraca: string[] // Posiciones 9-17 van al Fraca
  eliminated: string[] // El resto no clasifica
}

/**
 * Determina qué jugadores clasifican a la final,
 * cuáles van al Fraca, y cuáles quedan eliminados
 */
export function calculateQualification(
  standings: SeasonStanding[]
): QualificationResult {
  const sorted = [...standings].sort((a, b) => a.position - b.position)

  return {
    directToFinal: sorted.slice(0, 8).map((s) => s.playerId),
    toFraca: sorted.slice(8, 17).map((s) => s.playerId),
    eliminated: sorted.slice(17).map((s) => s.playerId),
  }
}
