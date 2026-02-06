import useSWR from 'swr'
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

interface EventResultsData {
  event: EventDetail | null
  results: EventResult[]
}

async function fetchEventResults(eventId: string): Promise<EventResultsData> {
  // Fetch event and results in parallel
  const [eventResponse, resultsResponse] = await Promise.all([
    supabase
      .from('event_nights')
      .select('*, seasons(name)')
      .eq('id', eventId)
      .single(),
    supabase
      .from('event_results')
      .select('position, points, rebuys, prize, players(*)')
      .eq('event_id', eventId)
      .order('position'),
  ])

  if (eventResponse.error) throw eventResponse.error
  if (!eventResponse.data) throw new Error('Event not found')

  const eventData = eventResponse.data
  const seasonData = eventData.seasons as unknown as { name: string } | null

  const event: EventDetail = {
    id: eventData.id,
    number: eventData.number,
    date: new Date(eventData.date),
    status: eventData.status,
    seasonId: eventData.season_id,
    seasonName: seasonData?.name ?? 'Temporada',
  }

  const results: EventResult[] = (resultsResponse.data ?? []).map((r) => {
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

  return { event, results }
}

export function useEventResults(eventId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    eventId ? `event-results-${eventId}` : null,
    () => fetchEventResults(eventId!),
    { revalidateOnFocus: false }
  )

  return {
    event: data?.event ?? null,
    results: data?.results ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
