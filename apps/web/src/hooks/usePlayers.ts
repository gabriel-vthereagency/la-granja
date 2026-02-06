import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

const MIN_PRESENCES = 30

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (fetchError) throw fetchError

        if (data) {
          const counts = new Map<string, number>()
          const pageSize = 1000
          let from = 0
          while (true) {
            const { data: presences, error: presenceError } = await supabase
              .from('event_results')
              .select('player_id')
              .range(from, from + pageSize - 1)

            if (presenceError) throw presenceError
            if (!presences || presences.length === 0) break

            for (const row of presences) {
              const pid = row.player_id as string
              counts.set(pid, (counts.get(pid) ?? 0) + 1)
            }

            if (presences.length < pageSize) break
            from += pageSize
          }

          const filtered = data.filter((p) => (counts.get(p.id) ?? 0) >= MIN_PRESENCES)

          setPlayers(
            filtered.map((p) => ({
              id: p.id,
              name: p.name,
              nickname: p.nickname,
              avatarUrl: p.avatar_url,
              isActive: p.is_active,
              createdAt: new Date(p.created_at),
              updatedAt: new Date(p.updated_at),
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading players')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { players, loading, error }
}
