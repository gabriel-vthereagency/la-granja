import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface StatsRow {
  rank: number
  player: string
  value: number
}

export interface StatsData {
  topPodiums: StatsRow[]
  topWins: StatsRow[]
  topLastPlaces: StatsRow[]
  topBubbles: StatsRow[]
  topEffectiveness: StatsRow[]
  topPresences: StatsRow[]
}

const TOP_LIMIT = 10
const MIN_EFFECTIVENESS_EVENTS = 30

export function useStats() {
  const [stats, setStats] = useState<StatsData>({
    topPodiums: [],
    topWins: [],
    topLastPlaces: [],
    topBubbles: [],
    topEffectiveness: [],
    topPresences: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const pageSize = 1000
        let from = 0
        const results: Array<{
          event_id: string
          player_id: string
          position: number
          points: number
          is_bubble: boolean | null
          players: { id: string; name: string } | null
        }> = []

        while (true) {
          const { data: page, error: resultsError } = await supabase
            .from('event_results')
            .select('event_id, player_id, position, points, is_bubble, players(id, name)')
            .range(from, from + pageSize - 1)

          if (resultsError) throw resultsError
          if (!page || page.length === 0) break

          results.push(...page)
          if (page.length < pageSize) break
          from += pageSize
        }

        if (!results.length) {
          setLoading(false)
          return
        }

        const maxPositionByEvent = new Map<string, number>()
        for (const r of results) {
          const pos = Number(r.position)
          if (pos > 0) {
            const current = maxPositionByEvent.get(r.event_id) ?? 0
            if (pos > current) maxPositionByEvent.set(r.event_id, pos)
          }
        }

        const perPlayer = new Map<string, {
          name: string
          points: number
          events: number
          podiums: number
          wins: number
          lastPlaces: number
          bubbles: number
        }>()

        for (const r of results) {
          const p = r.players as unknown as { id: string; name: string } | null
          if (!p) continue
          const current = perPlayer.get(r.player_id) ?? {
            name: p.name,
            points: 0,
            events: 0,
            podiums: 0,
            wins: 0,
            lastPlaces: 0,
            bubbles: 0,
          }

          const pos = Number(r.position)
          current.points += Number(r.points)
          current.events += 1

          if (pos >= 1 && pos <= 5) current.podiums += 1
          if (pos === 1) current.wins += 1

          const maxPos = maxPositionByEvent.get(r.event_id) ?? 0
          if (pos > 0 && pos === maxPos) current.lastPlaces += 1

          if (r.is_bubble === true) current.bubbles += 1

          perPlayer.set(r.player_id, current)
        }

        const toTop = (rows: Array<{ name: string; value: number }>) => {
          const sorted = rows
            .filter((row) => row.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, TOP_LIMIT)
          return sorted.map((row, index) => ({
            rank: index + 1,
            player: row.name,
            value: row.value,
          }))
        }

        const topPodiums = toTop(
          Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.podiums }))
        )
        const topWins = toTop(
          Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.wins }))
        )
        const topLastPlaces = toTop(
          Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.lastPlaces }))
        )
        const topBubbles = toTop(
          Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.bubbles }))
        )
        const topPresences = toTop(
          Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.events }))
        )
        const topEffectiveness = Array.from(perPlayer.values())
          .filter((p) => p.events >= MIN_EFFECTIVENESS_EVENTS)
          .map((p) => ({ name: p.name, value: p.points / p.events }))
          .sort((a, b) => b.value - a.value)
          .slice(0, TOP_LIMIT)
          .map((row, index) => ({
            rank: index + 1,
            player: row.name,
            value: row.value,
          }))

        setStats({
          topPodiums,
          topWins,
          topLastPlaces,
          topBubbles,
          topEffectiveness,
          topPresences,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading stats')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { stats, loading, error }
}
