export type EventStatus = 'scheduled' | 'live' | 'finished'

export type OfflineEventType = 'fraca' | 'final'

export interface EventNight {
  id: string
  seasonId: string
  number: number // Fecha #1, #2, etc.
  date: Date
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export interface EventResult {
  id: string
  eventId: string
  playerId: string
  position: number
  rebuys: number
  points: number
  prize: number
  createdAt: Date
}

export interface OfflineEvent {
  id: string
  seasonId: string
  type: OfflineEventType
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface OfflineEventResult {
  id: string
  offlineEventId: string
  playerId: string
  position: number
  createdAt: Date
}

// Fases del torneo
export type GamePhase = 'normal' | 'final_table' | 'heads_up' | 'champion'

// Estado en vivo del torneo (para sync realtime)
export interface LiveTournamentState {
  id: string
  eventId: string | null // null si es práctica/standalone
  currentLevel: number
  timeRemaining: number // segundos
  isPaused: boolean
  gamePhase: GamePhase // fase actual del torneo
  championId: string | null // ID del campeón cuando termina
  championName: string | null // Nombre del campeón
  players: LivePlayer[] // todos los jugadores registrados
  totalRebuys: number
  buyInAmount: number // valor de la caja en pesos
  // Info del torneo para display
  tournamentName: string | null // ej: "LA GRANJA POKER"
  seasonName: string | null // ej: "Summer Cup 2026"
  eventNumber: number | null // ej: 7
  totalEvents: number | null // ej: 9
  updatedAt: Date
}

export interface LivePlayer {
  id?: string // UUID de live_tournament_players (para operaciones DB) - opcional para nuevos
  playerId: string // ID del jugador en tabla players (ej: "shark")
  name: string
  status: 'active' | 'eliminated'
  position: number | null // null si sigue activo
  hasRebuy: boolean
}
