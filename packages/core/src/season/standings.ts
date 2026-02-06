import type { SeasonStanding, EventResult } from '@lagranja/types'

/**
 * Calcula la tabla de posiciones acumulada de una temporada
 * basándose en los resultados de cada fecha
 */
export function calculateSeasonStandings(
  seasonId: string,
  results: EventResult[]
): SeasonStanding[] {
  const playerPoints = new Map<string, { points: number; events: number }>()

  for (const result of results) {
    const current = playerPoints.get(result.playerId) ?? { points: 0, events: 0 }
    playerPoints.set(result.playerId, {
      points: current.points + result.points,
      events: current.events + 1,
    })
  }

  const standings: SeasonStanding[] = []
  for (const [playerId, data] of playerPoints) {
    standings.push({
      playerId,
      seasonId,
      totalPoints: data.points,
      eventsPlayed: data.events,
      position: 0, // se calcula abajo
    })
  }

  // Ordenar por puntos (mayor a menor) y asignar posiciones
  standings.sort((a, b) => b.totalPoints - a.totalPoints)
  standings.forEach((standing, index) => {
    standing.position = index + 1
  })

  return standings
}
