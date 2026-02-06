import { useCallback } from 'react'
import type { SeasonType } from '@lagranja/core'
import { supabase } from '../lib/supabase'

interface Season {
  id: string
  type: SeasonType
  year: number
  name: string
  status: 'upcoming' | 'active' | 'finished'
}

interface EventNight {
  id: string
  seasonId: string
  number: number
  date: string
  status: 'scheduled' | 'live' | 'finished'
}

export function useSeasons() {
  /**
   * Busca o crea una Season del tipo y ano especificado
   */
  const findOrCreateSeason = useCallback(
    async (type: SeasonType, year: number): Promise<Season | null> => {
      try {
        // Buscar season existente
        const { data: existing } = await supabase
          .from('seasons')
          .select('*')
          .eq('type', type)
          .eq('year', year)
          .single()

        if (existing) {
          return {
            id: existing.id,
            type: existing.type,
            year: existing.year,
            name: existing.name,
            status: existing.status,
          }
        }

        // Crear nueva season
        const name = getSeasonName(type, year)
        const { data: created, error } = await supabase
          .from('seasons')
          .insert({
            type,
            year,
            name,
            status: 'active',
          })
          .select()
          .single()

        if (error) throw error

        return created
          ? {
              id: created.id,
              type: created.type,
              year: created.year,
              name: created.name,
              status: created.status,
            }
          : null
      } catch (err) {
        console.error('Error finding/creating season:', err)
        return null
      }
    },
    []
  )

  /**
   * Busca o crea un EventNight para la season y numero especificados
   */
  const findOrCreateEventNight = useCallback(
    async (
      seasonId: string,
      eventNumber: number,
      date?: Date
    ): Promise<EventNight | null> => {
      try {
        // Buscar event existente
        const { data: existing } = await supabase
          .from('event_nights')
          .select('*')
          .eq('season_id', seasonId)
          .eq('number', eventNumber)
          .single()

        if (existing) {
          return {
            id: existing.id,
            seasonId: existing.season_id,
            number: existing.number,
            date: existing.date,
            status: existing.status,
          }
        }

        // Crear nuevo event
        const eventDate = date ?? new Date()
        const { data: created, error } = await supabase
          .from('event_nights')
          .insert({
            season_id: seasonId,
            number: eventNumber,
            date: eventDate.toISOString().split('T')[0],
            status: 'live',
          })
          .select()
          .single()

        if (error) throw error

        return created
          ? {
              id: created.id,
              seasonId: created.season_id,
              number: created.number,
              date: created.date,
              status: created.status,
            }
          : null
      } catch (err) {
        console.error('Error finding/creating event night:', err)
        return null
      }
    },
    []
  )

  /**
   * Busca o crea Season y EventNight basado en la info parseada
   * Retorna el event_id para asociar al live_tournament_state
   */
  const resolveEvent = useCallback(
    async (
      seasonType: SeasonType,
      eventNumber: number
    ): Promise<{ season: Season; event: EventNight } | null> => {
      const year = new Date().getFullYear()

      const season = await findOrCreateSeason(seasonType, year)
      if (!season) return null

      const event = await findOrCreateEventNight(season.id, eventNumber)
      if (!event) return null

      return { season, event }
    },
    [findOrCreateSeason, findOrCreateEventNight]
  )

  return {
    findOrCreateSeason,
    findOrCreateEventNight,
    resolveEvent,
  }
}

function getSeasonName(type: SeasonType, year: number): string {
  switch (type) {
    case 'apertura':
      return `Apertura ${year}`
    case 'clausura':
      return `Clausura ${year}`
    case 'summer':
      return `Summer Cup ${year}`
  }
}
