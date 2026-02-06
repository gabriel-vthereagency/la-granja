export interface Player {
  id: string
  name: string
  nickname?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PlayerAlias {
  id: string
  playerId: string
  alias: string
  createdAt: Date
}

export interface PlayerStats {
  playerId: string
  totalEvents: number
  totalWins: number
  totalFinalTables: number // top 8
  totalPoints: number
  avgPosition: number
  bestPosition: number
}

// Jugador en torneo activo
export interface TournamentPlayer {
  playerId: string
  playerName: string
  status: 'active' | 'eliminated'
  position?: number
  hasRebuy: boolean
  eliminatedAt?: Date
}
