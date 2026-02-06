/**
 * Sistema de matching de jugadores
 *
 * Busca jugadores existentes en la base de datos por nombre o alias
 */

import type { Player, PlayerAlias } from '@lagranja/types'
import type { ParsedEntry } from './whatsapp-parser'

export type MatchConfidence = 'exact' | 'alias' | 'none'

export interface MatchResult {
  entry: ParsedEntry
  player: Player | null
  confidence: MatchConfidence
  matchedBy: string | null // El valor que matcheó (nombre o alias)
}

export interface MatchContext {
  players: Player[]
  aliases: PlayerAlias[]
  /** IDs de jugadores ya registrados en el torneo actual (para ignorar duplicados) */
  alreadyRegistered?: string[]
}

/**
 * Normaliza texto para comparación case-insensitive
 */
function normalizeForComparison(text: string): string {
  return text.toLowerCase().trim()
}

/**
 * Busca un player por nombre exacto (case-insensitive)
 */
function findByExactName(
  name: string,
  players: Player[]
): Player | null {
  const normalizedSearch = normalizeForComparison(name)
  return players.find(
    (p) => normalizeForComparison(p.name) === normalizedSearch
  ) ?? null
}

/**
 * Busca un player por alias exacto (case-insensitive)
 */
function findByAlias(
  name: string,
  players: Player[],
  aliases: PlayerAlias[]
): { player: Player; alias: string } | null {
  const normalizedSearch = normalizeForComparison(name)

  const matchingAlias = aliases.find(
    (a) => normalizeForComparison(a.alias) === normalizedSearch
  )

  if (matchingAlias) {
    const player = players.find((p) => p.id === matchingAlias.playerId)
    if (player) {
      return { player, alias: matchingAlias.alias }
    }
  }

  return null
}

/**
 * Intenta matchear una entrada con un jugador existente
 */
function matchEntry(
  entry: ParsedEntry,
  context: MatchContext
): MatchResult {
  const { players, aliases } = context

  // 1. Buscar por nombre exacto
  const exactMatch = findByExactName(entry.normalizedName, players)
  if (exactMatch) {
    return {
      entry,
      player: exactMatch,
      confidence: 'exact',
      matchedBy: exactMatch.name,
    }
  }

  // 2. Buscar por alias
  const aliasMatch = findByAlias(entry.normalizedName, players, aliases)
  if (aliasMatch) {
    return {
      entry,
      player: aliasMatch.player,
      confidence: 'alias',
      matchedBy: aliasMatch.alias,
    }
  }

  // 3. No match
  return {
    entry,
    player: null,
    confidence: 'none',
    matchedBy: null,
  }
}

/**
 * Matchea una lista de entradas parseadas contra jugadores existentes
 *
 * @param entries - Entradas parseadas del WhatsApp
 * @param context - Contexto con players y aliases de la DB
 * @returns Array de resultados de matching
 */
export function matchPlayers(
  entries: ParsedEntry[],
  context: MatchContext
): MatchResult[] {
  const { alreadyRegistered = [] } = context

  return entries
    .map((entry) => matchEntry(entry, context))
    .filter((result) => {
      // Filtrar jugadores que ya están registrados en el torneo
      if (result.player && alreadyRegistered.includes(result.player.id)) {
        return false
      }
      return true
    })
}

/**
 * Separa los resultados en matched y unmatched
 */
export function splitMatchResults(results: MatchResult[]): {
  matched: MatchResult[]
  unmatched: MatchResult[]
} {
  const matched = results.filter((r) => r.player !== null)
  const unmatched = results.filter((r) => r.player === null)
  return { matched, unmatched }
}

/**
 * Cuenta cuántos matches hay por tipo de confianza
 */
export function countByConfidence(results: MatchResult[]): Record<MatchConfidence, number> {
  return results.reduce(
    (acc, r) => {
      acc[r.confidence]++
      return acc
    },
    { exact: 0, alias: 0, none: 0 } as Record<MatchConfidence, number>
  )
}
