import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface PodiumEntry {
  position: number
  player: Player
  points: number
}

export function useLastPodium(seasonId: string | null) {
  const [podium, setPodium] = useState<PodiumEntry[]>([])
  const [eventNumber, setEventNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        // Obtener la última fecha finalizada
        const { data: lastEvent } = await supabase
          .from('event_nights')
          .select('id, number')
          .eq('season_id', seasonId)
          .eq('status', 'finished')
          .order('number', { ascending: false })
          .limit(1)
          .single()

        if (!lastEvent) {
          setLoading(false)
          return
        }

        setEventNumber(lastEvent.number)

        // Obtener top 3 de esa fecha
        const { data: results } = await supabase
          .from('event_results')
          .select('position, points, players(*)')
          .eq('event_id', lastEvent.id)
          .gte('position', 1)
          .lte('position', 3)
          .order('position')

        if (results) {
          setPodium(
            results.map((r) => {
              const p = r.players as unknown as Record<string, unknown>
              return {
                position: r.position,
                points: Number(r.points),
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
        console.error('Error loading podium:', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [seasonId])

  return { podium, eventNumber, loading }
}
