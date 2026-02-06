import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { Season, Player } from '@lagranja/types'

export interface SeasonDetail extends Season {
  totalEvents: number
  finishedEvents: number
}

export interface SeasonChampions {
  regular: Player | null
  fraca: Player | null
  finalSeven: Player | null
  summerChampion: Player | null
}

interface SeasonData {
  season: SeasonDetail | null
  champions: SeasonChampions
}

async function fetchSeason(seasonId: string): Promise<SeasonData> {
  // Fetch all data in parallel
  const [seasonResponse, eventsResponse, hofResponse] = await Promise.all([
    supabase.from('seasons').select('*').eq('id', seasonId).single(),
    supabase.from('event_nights').select('id, status').eq('season_id', seasonId),
    supabase.from('hall_of_fame').select('tournament_type, players(*)').eq('season_id', seasonId),
  ])

  if (seasonResponse.error) throw seasonResponse.error
  if (!seasonResponse.data) throw new Error('Season not found')

  const seasonData = seasonResponse.data
  const events = eventsResponse.data ?? []
  const totalEvents = events.length
  const finishedEvents = events.filter((e) => e.status === 'finished').length

  const season: SeasonDetail = {
    id: seasonData.id,
    type: seasonData.type,
    year: seasonData.year,
    status: seasonData.status,
    name: seasonData.name,
    createdAt: new Date(seasonData.created_at),
    updatedAt: new Date(seasonData.updated_at),
    totalEvents,
    finishedEvents,
  }

  // Process champions
  const champions: SeasonChampions = {
    regular: null,
    fraca: null,
    finalSeven: null,
    summerChampion: null,
  }

  if (hofResponse.data) {
    for (const entry of hofResponse.data) {
      const p = entry.players as unknown as Record<string, unknown>
      if (!p) continue

      const player: Player = {
        id: p.id as string,
        name: p.name as string,
        nickname: p.nickname as string | undefined,
        avatarUrl: p.avatar_url as string | undefined,
        isActive: p.is_active as boolean,
        createdAt: new Date(p.created_at as string),
        updatedAt: new Date(p.updated_at as string),
      }

      if (entry.tournament_type === 'regular' || entry.tournament_type === 'apertura' || entry.tournament_type === 'clausura') {
        champions.regular = player
      } else if (entry.tournament_type === 'summer' || entry.tournament_type === 'summer_cup') {
        champions.summerChampion = player
      } else if (entry.tournament_type === 'fraca') {
        champions.fraca = player
      } else if (entry.tournament_type === 'final_seven') {
        champions.finalSeven = player
      }
    }
  }

  return { season, champions }
}

export function useSeason(seasonId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    seasonId ? `season-${seasonId}` : null,
    () => fetchSeason(seasonId!),
    { revalidateOnFocus: false }
  )

  return {
    season: data?.season ?? null,
    champions: data?.champions ?? {
      regular: null,
      fraca: null,
      finalSeven: null,
      summerChampion: null,
    },
    loading: isLoading,
    error: error?.message ?? null,
  }
}
