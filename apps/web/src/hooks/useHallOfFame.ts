import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface HofEntry {
  id: string
  tournamentType: string
  year: number
  playerName: string
  playerId: string
  playerAvatarUrl: string | null
  seasonName: string | null
}

export interface ShameEntry {
  title: string
  playerName: string
  playerId: string
  count: number
}

export function useHallOfFame() {
  const [champions, setChampions] = useState<HofEntry[]>([])
  const [shame, setShame] = useState<ShameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        // Fetch Hall of Fame entries
        const { data: hofData, error: hofError } = await supabase
          .from('hall_of_fame')
          .select('id, tournament_type, year, player_id, players(id, name, avatar_url), seasons(name)')
          .order('year', { ascending: false })
          .order('tournament_type')

        const baseChampions: HofEntry[] = []
        if (hofError) {
          // Table might not exist yet - continue with empty champions
          console.warn('Hall of Fame query error:', hofError.message)
        } else if (hofData) {
          for (const row of hofData) {
            const player = row.players as unknown as { id: string; name: string; avatar_url: string | null } | null
            const season = row.seasons as unknown as { name: string } | null
            baseChampions.push({
              id: row.id,
              tournamentType: row.tournament_type,
              year: row.year,
              playerName: player?.name ?? 'Desconocido',
              playerId: row.player_id,
              playerAvatarUrl: player?.avatar_url ?? null,
              seasonName: season?.name ?? null,
            })
          }
        }

        // Fetch Hall of Shame data (most last places and most bubbles)
        const pageSize = 1000
        let from = 0
        const allResults: Array<{
          event_id: string
          player_id: string
          position: number
          is_bubble: boolean | null
          players: { id: string; name: string } | null
        }> = []

        while (true) {
          const { data: page, error: resultsError } = await supabase
            .from('event_results')
            .select('event_id, player_id, position, is_bubble, players(id, name)')
            .range(from, from + pageSize - 1)

          if (resultsError) throw resultsError
          if (!page || page.length === 0) break

          allResults.push(...page)
          if (page.length < pageSize) break
          from += pageSize
        }

        // Calculate max position per event (to identify last place)
        const maxPositionByEvent = new Map<string, number>()
        for (const r of allResults) {
          const pos = Number(r.position)
          if (pos > 0) {
            const current = maxPositionByEvent.get(r.event_id) ?? 0
            if (pos > current) maxPositionByEvent.set(r.event_id, pos)
          }
        }

        // Count per player
        const perPlayer = new Map<string, {
          name: string
          lastPlaces: number
          bubbles: number
          secondPlaces: number
        }>()

        for (const r of allResults) {
          const p = r.players as unknown as { id: string; name: string } | null
          if (!p) continue

          const current = perPlayer.get(r.player_id) ?? {
            name: p.name,
            lastPlaces: 0,
            bubbles: 0,
            secondPlaces: 0,
          }

          const pos = Number(r.position)
          const maxPos = maxPositionByEvent.get(r.event_id) ?? 0
          if (pos > 0 && pos === maxPos) current.lastPlaces += 1
          if (r.is_bubble === true) current.bubbles += 1
          if (pos === 2) current.secondPlaces += 1

          perPlayer.set(r.player_id, current)
        }

        // Find top shame entries
        let mostSecondPlaces: ShameEntry = { title: 'Mas segundos puestos (Heads Up)', playerName: '-', playerId: '', count: 0 }
        let mostLastPlaces: ShameEntry = { title: 'Más últimos puestos', playerName: '-', playerId: '', count: 0 }
        let mostBubbles: ShameEntry = { title: 'Más burbujas (6°)', playerName: '-', playerId: '', count: 0 }

        for (const [playerId, stats] of perPlayer) {
          if (stats.lastPlaces > mostLastPlaces.count) {
            mostLastPlaces = { title: 'Más últimos puestos', playerName: stats.name, playerId, count: stats.lastPlaces }
          }
          if (stats.bubbles > mostBubbles.count) {
            mostBubbles = { title: 'Más burbujas (6°)', playerName: stats.name, playerId, count: stats.bubbles }
          }
          if (stats.secondPlaces > mostSecondPlaces.count) {
            mostSecondPlaces = { title: 'Mas segundos puestos (Heads Up)', playerName: stats.name, playerId, count: stats.secondPlaces }
          }
        }

        setShame([mostLastPlaces, mostBubbles, mostSecondPlaces])
        setChampions(baseChampions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading hall of fame')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { champions, shame, loading, error }
}