import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface PlayerProfile {
  player: Player
  aliases: string[]
  favoriteHand: string | null
  memberSince: Date | null
  stats: {
    totalEvents: number
    totalPoints: number
    effectiveness: number
    golds: number
    silvers: number
    bronzes: number
    fourths: number
    fifths: number
    lastPlaces: number
    finalTables: number
    bubbles: number
    finalSevens: number
    fracas: number
  }
}

export function usePlayerProfile(playerId: string | undefined) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId) {
      setLoading(false)
      return
    }

    async function fetch() {
      try {
        // Obtener jugador
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single()

        if (playerError) throw playerError
        if (!playerData) throw new Error('Player not found')

        // Obtener aliases
        const { data: aliasesData } = await supabase
          .from('player_aliases')
          .select('alias')
          .eq('player_id', playerId)

        // Obtener todos los resultados del jugador
        const { data: resultsData } = await supabase
          .from('event_results')
          .select('position, points, event_id, event_nights(date, number)')
          .eq('player_id', playerId)
          .order('event_nights(date)', { ascending: true })

        // Calcular stats
        let totalPoints = 0
        let golds = 0
        let silvers = 0
        let bronzes = 0
        let fourths = 0
        let fifths = 0
        let lastPlaces = 0
        let finalTables = 0
        let bubbles = 0
        let memberSince: Date | null = null

        // Obtener cantidad de jugadores por evento para calcular "último"
        const eventIds = resultsData?.map((r) => r.event_id) ?? []
        const playersPerEvent = new Map<string, number>()

        if (eventIds.length > 0) {
          const { data: allResults } = await supabase
            .from('event_results')
            .select('event_id, position')
            .in('event_id', eventIds)

          if (allResults) {
            for (const r of allResults) {
              const count = playersPerEvent.get(r.event_id) ?? 0
              playersPerEvent.set(r.event_id, Math.max(count, r.position))
            }
          }
        }

        if (resultsData) {
          for (const r of resultsData) {
            totalPoints += Number(r.points)
            if (r.position === 1) golds++
            if (r.position === 2) silvers++
            if (r.position === 3) bronzes++
            if (r.position === 4) fourths++
            if (r.position === 5) fifths++
            if (r.position === 6) bubbles++
            if (r.position <= 9) finalTables++

            const totalInEvent = playersPerEvent.get(r.event_id) ?? 0
            if (r.position === totalInEvent && totalInEvent > 1) lastPlaces++

            // Primera fecha
            const eventData = r.event_nights as unknown as { date: string } | null
            if (eventData?.date && !memberSince) {
              memberSince = new Date(eventData.date)
            }
          }
        }

        const totalEvents = resultsData?.length ?? 0
        const effectiveness = totalEvents > 0 ? totalPoints / totalEvents : 0

        // TODO: Contar Final Sevens y Fracas desde hall_of_fame/offline_events

        setProfile({
          player: {
            id: playerData.id,
            name: playerData.name,
            nickname: playerData.nickname,
            avatarUrl: playerData.avatar_url,
            isActive: playerData.is_active,
            createdAt: new Date(playerData.created_at),
            updatedAt: new Date(playerData.updated_at),
          },
          aliases: aliasesData?.map((a) => a.alias) ?? [],
          favoriteHand: playerData.favorite_hand ?? null,
          memberSince,
          stats: {
            totalEvents,
            totalPoints,
            effectiveness,
            golds,
            silvers,
            bronzes,
            fourths,
            fifths,
            lastPlaces,
            finalTables,
            bubbles,
            finalSevens: 0,
            fracas: 0,
          },
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [playerId])

  return { profile, loading, error }
}
