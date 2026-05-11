import {
  FIXED_POINTS,
  ATTENDANCE_POINTS,
  LAST_PLACE_PENALTY,
} from '@lagranja/types'

/**
 * Calcula los puntos para una posición dada.
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
 */
export function getPointsForPosition(
  position: number,
  totalPlayers?: number
): number {
  const fixedPoints = FIXED_POINTS[position]
  if (fixedPoints !== undefined) {
    return fixedPoints
  }

  if (!totalPlayers) {
    return 0
  }

  if (position === totalPlayers) {
    return LAST_PLACE_PENALTY
  }

  if (position >= 10 && position < totalPlayers) {
    return ATTENDANCE_POINTS
  }

  return 0
}

/**
 * Calcula los puntos para una lista de resultados de un evento.
 *
 * Recibe las posiciones reales tal como quedaron tras todos los cambios de roster.
 * Detecta el último lugar como `max(position)` entre los resultados, no por
 * igualdad con `totalPlayers`. Esto evita que un desfasaje entre el total y la
 * posición máxima haga perder la penalización.
 *
 * Si dos o más jugadores comparten la posición máxima (empate en último),
 * ninguno recibe la penalización: quedan como presencial.
 */
export function getPointsForResults(
  positions: number[]
): Map<number, number> {
  const result = new Map<number, number>()
  if (positions.length === 0) return result

  const maxPosition = Math.max(...positions)
  const occurrencesOfMax = positions.filter((p) => p === maxPosition).length
  const hasTieAtLast = occurrencesOfMax > 1
  const totalForPoints = hasTieAtLast ? maxPosition + 1 : maxPosition

  for (const position of positions) {
    result.set(position, getPointsForPosition(position, totalForPoints))
  }
  return result
}

/**
 * Calcula los puntos para todas las posiciones de un torneo (1..totalPlayers).
 * Utilidad para tablas de referencia.
 */
export function calculateAllPoints(
  totalPlayers: number
): Array<{ position: number; points: number }> {
  const results: Array<{ position: number; points: number }> = []
  for (let pos = 1; pos <= totalPlayers; pos++) {
    results.push({ position: pos, points: getPointsForPosition(pos, totalPlayers) })
  }
  return results
}
