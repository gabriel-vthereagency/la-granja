import { useEffect, useState, useCallback } from 'react'
import type { Player, PlayerAlias } from '@lagranja/types'
import { supabase } from '../lib/supabase'

/**
 * Genera un ID slug a partir del nombre
 * Ej: "Guille López" -> "guille-lopez"
 */
function generateSlugId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar no-alfanumericos por guion
    .replace(/^-|-$/g, '') // Remover guiones al inicio/fin
}

interface UsePlayersReturn {
  players: Player[]
  aliases: PlayerAlias[]
  loading: boolean
  error: string | null
  createPlayer: (name: string) => Promise<Player | null>
  createAlias: (playerId: string, alias: string) => Promise<void>
  refetch: () => Promise<void>
}

export function usePlayers(): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([])
  const [aliases, setAliases] = useState<PlayerAlias[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar jugadores
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (playersError) throw playersError

      // Cargar aliases
      const { data: aliasesData, error: aliasesError } = await supabase
        .from('player_aliases')
        .select('*')

      if (aliasesError) throw aliasesError

      const mappedPlayers: Player[] = (playersData ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        avatarUrl: p.avatar_url,
        isActive: p.is_active,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }))

      const mappedAliases: PlayerAlias[] = (aliasesData ?? []).map((a) => ({
        id: a.id,
        playerId: a.player_id,
        alias: a.alias,
        createdAt: new Date(a.created_at),
      }))

      setPlayers(mappedPlayers)
      setAliases(mappedAliases)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading players')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createPlayer = useCallback(async (name: string): Promise<Player | null> => {
    try {
      // Generar ID slug desde el nombre
      const baseId = generateSlugId(name)

      // Verificar si el ID ya existe, si es así agregar número
      let playerId = baseId
      let counter = 1
      while (true) {
        const { data: existing } = await supabase
          .from('players')
          .select('id')
          .eq('id', playerId)
          .single()

        if (!existing) break
        playerId = `${baseId}-${counter}`
        counter++
      }

      const { data, error: insertError } = await supabase
        .from('players')
        .insert({ id: playerId, name, is_active: true })
        .select()
        .single()

      if (insertError) throw insertError

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        nickname: data.nickname,
        avatarUrl: data.avatar_url,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      setPlayers((prev) => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)))
      return newPlayer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating player')
      return null
    }
  }, [])

  const createAlias = useCallback(async (playerId: string, alias: string): Promise<void> => {
    try {
      const { data, error: insertError } = await supabase
        .from('player_aliases')
        .insert({ player_id: playerId, alias })
        .select()
        .single()

      if (insertError) throw insertError

      const newAlias: PlayerAlias = {
        id: data.id,
        playerId: data.player_id,
        alias: data.alias,
        createdAt: new Date(data.created_at),
      }

      setAliases((prev) => [...prev, newAlias])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating alias')
    }
  }, [])

  return {
    players,
    aliases,
    loading,
    error,
    createPlayer,
    createAlias,
    refetch: fetchData,
  }
}
