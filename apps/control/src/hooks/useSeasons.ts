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
  const findOrCreateSeason = useCallback(
    async (type: SeasonType, year: number): Promise<Season> => {
      // Use maybeSingle() so "not found" returns null error instead of PGRST116
      const { data: existing, error: fetchError } = await supabase
        .from('seasons')
        .select('*')
        .eq('type', type)
        .eq('year', year)
        .maybeSingle()

      if (fetchError) throw new Error(`Error buscando season: ${fetchError.message}`)

      if (existing) {
        return {
          id: existing.id,
          type: existing.type,
          year: existing.year,
          name: existing.name,
          status: existing.status,
        }
      }

      const name = getSeasonName(type, year)
      const { data: created, error: insertError } = await supabase
        .from('seasons')
        .insert({ type, year, name, status: 'active' })
        .select()
        .single()

      if (insertError) throw new Error(`Error creando season: ${insertError.message}`)
      if (!created) throw new Error('Season no fue creada')

      return {
        id: created.id,
        type: created.type,
        year: created.year,
        name: created.name,
        status: created.status,
      }
    },
    []
  )

  const findOrCreateEventNight = useCallback(
    async (
      seasonId: string,
      eventNumber: number,
      date?: Date
    ): Promise<EventNight> => {
      const { data: existing, error: fetchError } = await supabase
        .from('event_nights')
        .select('*')
        .eq('season_id', seasonId)
        .eq('number', eventNumber)
        .maybeSingle()

      if (fetchError) throw new Error(`Error buscando fecha: ${fetchError.message}`)

      if (existing) {
        return {
          id: existing.id,
          seasonId: existing.season_id,
          number: existing.number,
          date: existing.date,
          status: existing.status,
        }
      }

      const eventDate = date ?? new Date()
      const { data: created, error: insertError } = await supabase
        .from('event_nights')
        .insert({
          season_id: seasonId,
          number: eventNumber,
          date: eventDate.toISOString().split('T')[0],
          status: 'live',
        })
        .select()
        .single()

      if (insertError) throw new Error(`Error creando fecha: ${insertError.message}`)
      if (!created) throw new Error('Fecha no fue creada')

      return {
        id: created.id,
        seasonId: created.season_id,
        number: created.number,
        date: created.date,
        status: created.status,
      }
    },
    []
  )

  /**
   * Busca o crea Season y EventNight. Lanza error en vez de retornar null
   * para que los llamadores puedan surfacear el problema al usuario.
   */
  const resolveEvent = useCallback(
    async (
      seasonType: SeasonType,
      eventNumber: number
    ): Promise<{ season: Season; event: EventNight }> => {
      const year = new Date().getFullYear()
      const season = await findOrCreateSeason(seasonType, year)
      const event = await findOrCreateEventNight(season.id, eventNumber)
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
