// Estructura de blinds
export type BlindLevelType = 'level' | 'break'

export interface BlindLevel {
  index: number
  type: BlindLevelType
  sb: number | null // null en break
  bb: number | null // null en break
  ante: number | null
  durationSec: number
}

// Configuración del torneo
export interface TournamentConfig {
  startingStack: number
  rebuyStack: number
  maxRebuys: number
  buyInAmount: number // valor de la caja en pesos
  blindStructure: BlindLevel[]
}

// Distribución de premios
export interface PrizeDistribution {
  position: number
  percentage: number
  points: number
}

// Constantes de la liga
export const TOURNAMENT_CONFIG: TournamentConfig = {
  startingStack: 1000,
  rebuyStack: 1000,
  maxRebuys: 1,
  buyInAmount: 10000,
  blindStructure: [], // se carga desde BLIND_STRUCTURE
}

export const PRIZE_DISTRIBUTION: PrizeDistribution[] = [
  { position: 1, percentage: 40, points: 16 },
  { position: 2, percentage: 25, points: 10 },
  { position: 3, percentage: 15, points: 7 },
  { position: 4, percentage: 10, points: 4 },
  { position: 5, percentage: 0, points: 2 },
  // Posiciones 6-9 se manejan en getPointsForPosition()
]

// Puntos para posiciones fijas (1-9)
export const FIXED_POINTS: Record<number, number> = {
  1: 16,
  2: 10,
  3: 7,
  4: 4,
  5: 2,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
}

// Puntos por presencial (posiciones 10 a n-1)
export const ATTENDANCE_POINTS = 0.5

// Penalización por último lugar
export const LAST_PLACE_PENALTY = -0.5


export const BLIND_STRUCTURE: BlindLevel[] = [
  { index: 0, type: 'level', sb: 2, bb: 4, ante: 0, durationSec: 720 },
  { index: 1, type: 'level', sb: 3, bb: 6, ante: 0, durationSec: 720 },
  { index: 2, type: 'level', sb: 4, bb: 8, ante: 0, durationSec: 720 },
  { index: 3, type: 'level', sb: 5, bb: 10, ante: 0, durationSec: 720 },
  { index: 4, type: 'level', sb: 6, bb: 12, ante: 0, durationSec: 720 },
  { index: 5, type: 'level', sb: 7, bb: 14, ante: 0, durationSec: 720 },
  { index: 6, type: 'level', sb: 8, bb: 16, ante: 0, durationSec: 720 },
  { index: 7, type: 'level', sb: 10, bb: 20, ante: 0, durationSec: 720 },
  { index: 8, type: 'level', sb: 15, bb: 30, ante: 0, durationSec: 720 },
  { index: 9, type: 'level', sb: 20, bb: 40, ante: 0, durationSec: 720 },
  { index: 10, type: 'level', sb: 25, bb: 50, ante: 0, durationSec: 720 },
  { index: 11, type: 'break', sb: null, bb: null, ante: null, durationSec: 1800 },
  { index: 12, type: 'level', sb: 30, bb: 60, ante: 0, durationSec: 900 },
  { index: 13, type: 'level', sb: 40, bb: 80, ante: 0, durationSec: 900 },
  { index: 14, type: 'level', sb: 50, bb: 100, ante: 0, durationSec: 900 },
  { index: 15, type: 'level', sb: 60, bb: 120, ante: 0, durationSec: 900 },
  { index: 16, type: 'level', sb: 80, bb: 160, ante: 0, durationSec: 900 },
  { index: 17, type: 'level', sb: 100, bb: 200, ante: 0, durationSec: 900 },
  { index: 18, type: 'level', sb: 125, bb: 250, ante: 0, durationSec: 900 },
  { index: 19, type: 'level', sb: 150, bb: 300, ante: 0, durationSec: 900 },
  { index: 20, type: 'level', sb: 200, bb: 400, ante: 0, durationSec: 900 },
  { index: 21, type: 'level', sb: 250, bb: 500, ante: 0, durationSec: 900 },
  { index: 22, type: 'level', sb: 300, bb: 600, ante: 0, durationSec: 900 },
  { index: 23, type: 'level', sb: 350, bb: 700, ante: 0, durationSec: 900 },
  { index: 24, type: 'level', sb: 400, bb: 800, ante: 0, durationSec: 900 },
  { index: 25, type: 'level', sb: 500, bb: 1000, ante: 0, durationSec: 900 },
  { index: 26, type: 'level', sb: 600, bb: 1200, ante: 0, durationSec: 900 },
]
