import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface EventDetail {
  id: string
  number: number
  date: Date
  status: 'scheduled' | 'live' | 'finished'
  seasonId: string
  seasonName: string
}

export interface EventResult {
  position: number
  player: Player
  points: number
  rebuys: number
  prize: number
}

export function useEventResults(eventId: string | undefined) {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [results, setResults] = useState<EventResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        // Obtener evento con info de temporada
        const { data: eventData, error: eventError } = await supabase
          .from('event_nights')
          .select('*, seasons(name)')
          .eq('id', eventId)
          .single()

        if (eventError) throw eventError
        if (!eventData) throw new Error('Event not found')

        const seasonData = eventData.seasons as unknown as { name: string } | null

        setEvent({
          id: eventData.id,
          number: eventData.number,
          date: new Date(eventData.date),
          status: eventData.status,
          seasonId: eventData.season_id,
          seasonName: seasonData?.name ?? 'Temporada',
        })

        // Obtener resultados
        const { data: resultsData, error: resultsError } = await supabase
          .from('event_results')
          .select('position, points, rebuys, prize, players(*)')
          .eq('event_id', eventId)
          .order('position')

        if (resultsError) throw resultsError

        if (resultsData) {
          setResults(
            resultsData.map((r) => {
              const p = r.players as unknown as Record<string, unknown>
              return {
                position: r.position,
                points: Number(r.points),
                rebuys: r.rebuys ?? 0,
                prize: r.prize ?? 0,
                player: {
                  id: p.id as string,
                  name: p.name as string,
                  nickname: p.nickname as string | undefined,
                  avatarUrl: p.avatar_url as string | undefined,
                  isActive: p.is_active as boolean,
                  createdAt: new Date(p.created_at as string),
                  updatedAt: new Date(p.updated_at as string),
                },
              }
            })
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading event')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [eventId])

  return { event, results, loading, error }
}
