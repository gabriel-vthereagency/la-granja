import {
  FIXED_POINTS,
  ATTENDANCE_POINTS,
  LAST_PLACE_PENALTY,
} from '@lagranja/types'

/**
 * Calcula los puntos para una posición dada
 *
 * Sistema de puntos:
 * - 1°: 16 puntos
 * - 2°: 10 puntos
 * - 3°: 7 puntos
 * - 4°: 4 puntos
 * - 5°: 2 puntos
 * - 6° a 9°: 1 punto (mesa final)
 * - 10° a n-1: 0.5 puntos (presencial)
 * - n (último): -0.5 puntos (penalización)
 *
 * @param position - Posición final del jugador (1 = campeón)
 * @param totalPlayers - Total de jugadores en el torneo
 * @returns Puntos obtenidos
 */
export function getPointsForPosition(
  position: number,
  totalPlayers?: number
): number {
  // Posiciones fijas (1-9)
  const fixedPoints = FIXED_POINTS[position]
  if (fixedPoints !== undefined) {
    return fixedPoints
  }

  // Si no tenemos total de jugadores, no podemos calcular presencial/último
  if (!totalPlayers) {
    return 0
  }

  // Último lugar (penalización)
  if (position === totalPlayers) {
    return LAST_PLACE_PENALTY
  }

  // Posiciones 10 a n-1 (presencial)
  if (position >= 10 && position < totalPlayers) {
    return ATTENDANCE_POINTS
  }

  return 0
}

/**
 * Calcula los puntos para todas las posiciones de un torneo
 */
export function calculateAllPoints(
  totalPlayers: number
): Array<{ position: number; points: number }> {
  const results: Array<{ position: number; points: number }> = []

  for (let pos = 1; pos <= totalPlayers; pos++) {
    results.push({
      position: pos,
      points: getPointsForPosition(pos, totalPlayers),
    })
  }

  return results
}
