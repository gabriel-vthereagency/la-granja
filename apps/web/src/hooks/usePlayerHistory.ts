import useSWR from 'swr'
import { supabase } from '../lib/supabase'

export interface PlayerHistoryEntry {
  eventId: string
  seasonId: string
  seasonName: string
  eventNumber: number
  date: Date
  position: number
  points: number
  isLastPlace: boolean
}

async function fetchPlayerHistory(playerId: string): Promise<PlayerHistoryEntry[]> {
  const { data, error } = await supabase
    .from('event_results')
    .select('position, points, event_nights(id, number, date, season_id, seasons(name))')
    .eq('player_id', playerId)
    .order('event_nights(date)', { ascending: false })

  if (error) throw error
  if (!data?.length) return []

  const entries = data.map((r) => {
    const en = r.event_nights as unknown as {
      id: string
      number: number
      date: string
      season_id: string
      seasons: { name: string } | null
    }
    return {
      eventId: en.id,
      seasonId: en.season_id,
      seasonName: en.seasons?.name ?? 'Temporada',
      eventNumber: en.number,
      date: new Date(en.date),
      position: r.position,
      points: Number(r.points),
    }
  })

  // Get max position per event to detect last places
  const eventIds = [...new Set(entries.map((e) => e.eventId))]
  const { data: allResults } = await supabase
    .from('event_results')
    .select('event_id, position')
    .in('event_id', eventIds)
    .gt('position', 0)

  const maxPositionByEvent = new Map<string, number>()
  for (const r of allResults ?? []) {
    const current = maxPositionByEvent.get(r.event_id) ?? 0
    if (r.position > current) maxPositionByEvent.set(r.event_id, r.position)
  }

  // Filter: only notable results (final table = top 9, or last place), exclude position 0
  return entries
    .filter((e) => e.position > 0)
    .map((e) => ({
      ...e,
      isLastPlace: e.position > 9 && e.position === (maxPositionByEvent.get(e.eventId) ?? 0),
    }))
    .filter((e) => e.position <= 9 || e.isLastPlace)
}

export function usePlayerHistory(playerId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    playerId ? `player-history-${playerId}` : null,
    () => fetchPlayerHistory(playerId!),
    { revalidateOnFocus: false }
  )

  return {
    history: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
