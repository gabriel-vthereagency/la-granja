import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Season } from '@lagranja/types'

export interface ActiveSeasonWithEvents extends Season {
  totalEvents: number
}

// Total de fechas por tipo de torneo (hardcodeado)
const TOTAL_EVENTS_BY_TYPE: Record<string, number> = {
  apertura: 20,
  clausura: 20,
  summer: 9,
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [activeSeason, setActiveSeason] = useState<ActiveSeasonWithEvents | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: fetchError } = await supabase
          .from('seasons')
          .select('*')
          .order('year', { ascending: false })
          .order('type')

        if (fetchError) throw fetchError

        if (data) {
          const mapped: Season[] = data.map((row) => ({
            id: row.id,
            type: row.type,
            year: row.year,
            status: row.status,
            name: row.name,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          }))
          setSeasons(mapped)

          // Find active season and set total events based on type
          const active = mapped.find((s) => s.status === 'active') ?? mapped[0] ?? null
          if (active) {
            const totalEvents = TOTAL_EVENTS_BY_TYPE[active.type] ?? 9
            setActiveSeason({ ...active, totalEvents })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading seasons')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { seasons, activeSeason, loading, error }
}
