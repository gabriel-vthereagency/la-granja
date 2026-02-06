import useSWR from 'swr'
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

async function fetchSeasons(): Promise<{ seasons: Season[]; activeSeason: ActiveSeasonWithEvents | null }> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })
    .order('type')

  if (error) throw error

  const seasons: Season[] = (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    year: row.year,
    status: row.status,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }))

  const active = seasons.find((s) => s.status === 'active') ?? seasons[0] ?? null
  let activeSeason: ActiveSeasonWithEvents | null = null

  if (active) {
    const totalEvents = TOTAL_EVENTS_BY_TYPE[active.type] ?? 9
    activeSeason = { ...active, totalEvents }
  }

  return { seasons, activeSeason }
}

export function useSeasons() {
  const { data, error, isLoading } = useSWR('seasons', fetchSeasons, {
    revalidateOnFocus: false,
  })

  return {
    seasons: data?.seasons ?? [],
    activeSeason: data?.activeSeason ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  }
}
