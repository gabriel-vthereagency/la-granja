import type { BlindLevel } from '@lagranja/types'
import { BLIND_STRUCTURE } from '@lagranja/types'

// Re-exportar BLIND_STRUCTURE para que esté disponible desde @lagranja/core
export { BLIND_STRUCTURE }

/**
 * Obtiene el nivel de blinds por índice
 */
export function getBlindLevel(index: number): BlindLevel | undefined {
  return BLIND_STRUCTURE.find((b) => b.index === index)
}

/**
 * Obtiene el siguiente nivel (puede ser break o nivel)
 */
export function getNextLevel(currentIndex: number): BlindLevel | undefined {
  return BLIND_STRUCTURE.find((b) => b.index === currentIndex + 1)
}

/**
 * Verifica si el nivel actual es un break
 */
export function isBreak(index: number): boolean {
  const level = getBlindLevel(index)
  return level?.type === 'break'
}

/**
 * Obtiene el próximo nivel de juego (saltando breaks)
 */
export function getNextPlayableLevel(currentIndex: number): BlindLevel | undefined {
  let nextIndex = currentIndex + 1
  let level = BLIND_STRUCTURE.find((b) => b.index === nextIndex)

  while (level && level.type === 'break') {
    nextIndex++
    level = BLIND_STRUCTURE.find((b) => b.index === nextIndex)
  }

  return level
}

/**
 * Formatea los blinds para mostrar (ej: "25/50")
 */
export function formatBlinds(level: BlindLevel): string {
  if (level.type === 'break') {
    return 'BREAK'
  }
  return `${level.sb}/${level.bb}`
}

/**
 * Formatea la duración en minutos
 */
export function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60)
  return `${minutes} min`
}

/**
 * Obtiene el total de niveles (sin contar breaks)
 */
export function getTotalLevels(): number {
  return BLIND_STRUCTURE.filter((b) => b.type === 'level').length
}
