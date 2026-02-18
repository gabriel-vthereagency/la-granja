import { PRIZE_DISTRIBUTION } from '@lagranja/types'

export interface PrizeCalculation {
  position: number
  percentage: number
  amount: number
  points: number
}

export interface PrizePoolBreakdown {
  totalEntries: number
  totalRebuys: number
  buyInAmount: number
  grossPool: number
  venueAmount: number
  f7Amount: number // Fondo para final offline
  netPool: number // Lo que se reparte a jugadores (80% del bruto)
  prizes: PrizeCalculation[]
}

/**
 * Calcula el pozo total y la distribución de premios
 *
 * El 100% de las entradas y rebuys va al pozo de premios.
 * La sede y el fondo F7 se pagan aparte (no se descuentan del pozo).
 * Distribución: 1° 40%, 2° 25%, 3° 15%, 4° 10%
 */
export function calculatePrizePool(
  entries: number,
  rebuys: number,
  buyInAmount: number
): PrizePoolBreakdown {
  const totalBuyIns = entries + rebuys
  const grossPool = totalBuyIns * buyInAmount
  const venueAmount = 0
  const f7Amount = 0
  const netPool = grossPool

  const prizes: PrizeCalculation[] = PRIZE_DISTRIBUTION.map((dist) => ({
    position: dist.position,
    percentage: dist.percentage,
    amount: (netPool * dist.percentage) / 100,
    points: dist.points,
  }))

  return {
    totalEntries: entries,
    totalRebuys: rebuys,
    buyInAmount,
    grossPool,
    venueAmount,
    f7Amount,
    netPool,
    prizes,
  }
}

/**
 * Obtiene el premio en efectivo para una posición
 */
export function getPrizeForPosition(
  position: number,
  netPool: number
): number {
  const dist = PRIZE_DISTRIBUTION.find((p) => p.position === position)
  if (!dist) return 0
  return (netPool * dist.percentage) / 100
}

/**
 * Formatea un monto en pesos argentinos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
