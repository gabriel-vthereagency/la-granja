export type SeasonType = 'apertura' | 'clausura' | 'summer'

export type SeasonStatus = 'upcoming' | 'active' | 'finished'

export interface Season {
  id: string
  type: SeasonType
  year: number
  status: SeasonStatus
  name: string // "Apertura 2024"
  createdAt: Date
  updatedAt: Date
}

export interface SeasonStanding {
  playerId: string
  seasonId: string
  totalPoints: number
  eventsPlayed: number
  position: number
}

export interface SeasonSummary {
  season: Season
  standings: SeasonStanding[]
}
