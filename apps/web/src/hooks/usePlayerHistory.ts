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
  rebuys: number
}

async function fetchPlayerHistory(playerId: string): Promise<PlayerHistoryEntry[]> {
  const { data, error } = await supabase
    .from('event_results')
    .select('position, points, rebuys, event_nights(id, number, date, season_id, seasons(name))')
    .eq('player_id', playerId)
    .order('event_nights(date)', { ascending: false })

  if (error) throw error

  return (data ?? []).map((r) => {
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
      rebuys: r.rebuys ?? 0,
    }
  })
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
