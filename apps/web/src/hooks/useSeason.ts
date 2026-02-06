import { useEffect, useState } from 'react'
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

export function useSeason(seasonId: string | undefined) {
  const [season, setSeason] = useState<SeasonDetail | null>(null)
  const [champions, setChampions] = useState<SeasonChampions>({
    regular: null,
    fraca: null,
    finalSeven: null,
    summerChampion: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        // Obtener temporada
        const { data: seasonData, error: seasonError } = await supabase
          .from('seasons')
          .select('*')
          .eq('id', seasonId)
          .single()

        if (seasonError) throw seasonError
        if (!seasonData) throw new Error('Season not found')

        // Contar eventos
        const { data: events } = await supabase
          .from('event_nights')
          .select('id, status')
          .eq('season_id', seasonId)

        const totalEvents = events?.length ?? 0
        const finishedEvents = events?.filter((e) => e.status === 'finished').length ?? 0

        setSeason({
          id: seasonData.id,
          type: seasonData.type,
          year: seasonData.year,
          status: seasonData.status,
          name: seasonData.name,
          createdAt: new Date(seasonData.created_at),
          updatedAt: new Date(seasonData.updated_at),
          totalEvents,
          finishedEvents,
        })

        // Obtener campeones desde hall_of_fame
        const { data: hofData } = await supabase
          .from('hall_of_fame')
          .select('tournament_type, players(*)')
          .eq('season_id', seasonId)

        if (hofData) {
          const championsData: SeasonChampions = {
            regular: null,
            fraca: null,
            finalSeven: null,
            summerChampion: null,
          }

          for (const entry of hofData) {
            const p = entry.players as unknown as Record<string, unknown>
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
              championsData.regular = player
            } else if (entry.tournament_type === 'summer' || entry.tournament_type === 'summer_cup') {
              championsData.summerChampion = player
            } else if (entry.tournament_type === 'fraca') {
              championsData.fraca = player
            } else if (entry.tournament_type === 'final_seven') {
              championsData.finalSeven = player
            }
          }

          setChampions(championsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading season')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [seasonId])

  return { season, champions, loading, error }
}
