import useSWR from 'swr'
import { supabase } from '../lib/supabase'

export interface SeasonEvent {
  id: string
  number: number
  date: Date
  status: 'scheduled' | 'live' | 'finished'
}

async function fetchSeasonEvents(seasonId: string): Promise<SeasonEvent[]> {
  const { data, error } = await supabase
    .from('event_nights')
    .select('id, number, date, status')
    .eq('season_id', seasonId)
    .order('number', { ascending: false })

  if (error) throw error

  return (data ?? []).map((e) => ({
    id: e.id,
    number: e.number,
    date: new Date(e.date),
    status: e.status,
  }))
}

export function useSeasonEvents(seasonId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    seasonId ? `events-${seasonId}` : null,
    () => fetchSeasonEvents(seasonId!),
    { revalidateOnFocus: false }
  )

  return {
    events: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
