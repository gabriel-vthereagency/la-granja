import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface SeasonEvent {
  id: string
  number: number
  date: Date
  status: 'scheduled' | 'live' | 'finished'
}

export function useSeasonEvents(seasonId: string | undefined) {
  const [events, setEvents] = useState<SeasonEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        const { data, error: fetchError } = await supabase
          .from('event_nights')
          .select('id, number, date, status')
          .eq('season_id', seasonId)
          .order('number', { ascending: false })

        if (fetchError) throw fetchError

        if (data) {
          setEvents(
            data.map((e) => ({
              id: e.id,
              number: e.number,
              date: new Date(e.date),
              status: e.status,
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading events')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [seasonId])

  return { events, loading, error }
}
