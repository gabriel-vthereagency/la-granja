import { PRIZE_DISTRIBUTION, VENUE_PERCENTAGE, F7_PERCENTAGE } from '@lagranja/types'

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
 * Distribución del pozo bruto:
 * - 10% sede (VENUE_PERCENTAGE)
 * - 10% fondo final offline F7 (F7_PERCENTAGE)
 * - 80% premios a jugadores:
 *   - 1° 40%, 2° 25%, 3° 15%, 4° 10%
 */
export function calculatePrizePool(
  entries: number,
  rebuys: number,
  buyInAmount: number
): PrizePoolBreakdown {
  const totalBuyIns = entries + rebuys
  const grossPool = totalBuyIns * buyInAmount
  const venueAmount = (grossPool * VENUE_PERCENTAGE) / 100
  const f7Amount = (grossPool * F7_PERCENTAGE) / 100
  const netPool = grossPool - venueAmount - f7Amount

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
