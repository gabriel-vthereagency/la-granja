import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface PodiumEntry {
  position: number
  player: Player
  points: number
}

interface PodiumData {
  podium: PodiumEntry[]
  eventNumber: number | null
}

async function fetchLastPodium(seasonId: string): Promise<PodiumData> {
  // Try using the optimized view first
  const { data: lastEventView } = await supabase
    .from('last_event_per_season')
    .select('*')
    .eq('season_id', seasonId)
    .single()

  const lastEventId = lastEventView?.event_id
  const eventNumber = lastEventView?.event_number ?? null

  if (!lastEventId) {
    // Fallback: get last finished event
    const { data: lastEvent } = await supabase
      .from('event_nights')
      .select('id, number')
      .eq('season_id', seasonId)
      .eq('status', 'finished')
      .order('number', { ascending: false })
      .limit(1)
      .single()

    if (!lastEvent) {
      return { podium: [], eventNumber: null }
    }

    const { data: results } = await supabase
      .from('event_results')
      .select('position, points, players(*)')
      .eq('event_id', lastEvent.id)
      .gte('position', 1)
      .lte('position', 3)
      .order('position')

    if (!results) {
      return { podium: [], eventNumber: lastEvent.number }
    }

    return {
      podium: results.map((r) => {
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
      }),
      eventNumber: lastEvent.number,
    }
  }

  // Use the view result
  const { data: results } = await supabase
    .from('event_results')
    .select('position, points, players(*)')
    .eq('event_id', lastEventId)
    .gte('position', 1)
    .lte('position', 3)
    .order('position')

  if (!results) {
    return { podium: [], eventNumber }
  }

  return {
    podium: results.map((r) => {
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
    }),
    eventNumber,
  }
}

export function useLastPodium(seasonId: string | null) {
  const { data, isLoading } = useSWR(
    seasonId ? `podium-${seasonId}` : null,
    () => fetchLastPodium(seasonId!),
    { revalidateOnFocus: false }
  )

  return {
    podium: data?.podium ?? [],
    eventNumber: data?.eventNumber ?? null,
    loading: isLoading,
  }
}
