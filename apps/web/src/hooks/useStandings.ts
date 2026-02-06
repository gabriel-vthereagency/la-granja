import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

// Estadísticas extendidas para la tabla
export interface PlayerStanding {
  position: number
  playerId: string
  player: Player
  totalPoints: number
  eventsPlayed: number
  golds: number      // 1°
  silvers: number    // 2°
  bronzes: number    // 3°
  fourths: number    // 4°
  fifths: number     // 5°
  podiums: number    // top 5
  lastPlaces: number // último
  finalTables: number // top 9
  bubbles: number    // 6°
}

export function useStandings(seasonId: string | null) {
  const [standings, setStandings] = useState<PlayerStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        // Obtener todas las fechas finalizadas de la temporada
        const { data: events, error: eventsError } = await supabase
          .from('event_nights')
          .select('id, number')
          .eq('season_id', seasonId)
          .eq('status', 'finished')
          .order('number')

        if (eventsError) throw eventsError

        if (!events?.length) {
          setStandings([])
          setLoading(false)
          return
        }

        const eventIds = events.map((e) => e.id)

        // Obtener todos los resultados con info del jugador
        const { data: results, error: resultsError } = await supabase
          .from('event_results')
          .select('*, players(*)')
          .in('event_id', eventIds)

        if (resultsError) throw resultsError

        if (!results?.length) {
          setStandings([])
          setLoading(false)
          return
        }

        // Agrupar resultados por jugador
        const playerStats = new Map<string, {
          player: Player
          points: number
          events: number
          golds: number
          silvers: number
          bronzes: number
          fourths: number
          fifths: number
          lastPlaces: number
          finalTables: number
          bubbles: number
          positions: number[]
        }>()

        // Obtener cuántos jugadores hubo en cada fecha para calcular "último"
        const playersPerEvent = new Map<string, number>()
        for (const r of results) {
          const count = playersPerEvent.get(r.event_id) ?? 0
          playersPerEvent.set(r.event_id, Math.max(count, r.position))
        }

        for (const r of results) {
          const p = r.players as unknown as Record<string, unknown>
          const current = playerStats.get(r.player_id) ?? {
            player: {
              id: p.id as string,
              name: p.name as string,
              nickname: p.nickname as string | undefined,
              avatarUrl: p.avatar_url as string | undefined,
              isActive: p.is_active as boolean,
              createdAt: new Date(p.created_at as string),
              updatedAt: new Date(p.updated_at as string),
            },
            points: 0,
            events: 0,
            golds: 0,
            silvers: 0,
            bronzes: 0,
            fourths: 0,
            fifths: 0,
            lastPlaces: 0,
            finalTables: 0,
            bubbles: 0,
            positions: [] as number[],
          }

          current.points += Number(r.points)
          current.events += 1
          current.positions.push(r.position)

          // Contar posiciones
          if (r.position === 1) current.golds++
          if (r.position === 2) current.silvers++
          if (r.position === 3) current.bronzes++
          if (r.position === 4) current.fourths++
          if (r.position === 5) current.fifths++
          if (r.position === 6) current.bubbles++
          if (r.position <= 9) current.finalTables++

          // Verificar si fue último en esa fecha
          const totalInEvent = playersPerEvent.get(r.event_id) ?? 0
          if (r.position === totalInEvent) current.lastPlaces++

          playerStats.set(r.player_id, current)
        }

        // Convertir a array y ordenar por puntos
        const standingsArray: PlayerStanding[] = []
        for (const [playerId, stats] of playerStats) {
          standingsArray.push({
            position: 0, // se asigna después
            playerId,
            player: stats.player,
            totalPoints: stats.points,
            eventsPlayed: stats.events,
            golds: stats.golds,
            silvers: stats.silvers,
            bronzes: stats.bronzes,
            fourths: stats.fourths,
            fifths: stats.fifths,
            podiums: stats.golds + stats.silvers + stats.bronzes + stats.fourths + stats.fifths,
            lastPlaces: stats.lastPlaces,
            finalTables: stats.finalTables,
            bubbles: stats.bubbles,
          })
        }

        // Ordenar por puntos y asignar posiciones
        standingsArray.sort((a, b) => b.totalPoints - a.totalPoints)
        standingsArray.forEach((s, i) => {
          s.position = i + 1
        })

        setStandings(standingsArray)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading standings')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [seasonId])

  return { standings, loading, error }
}
