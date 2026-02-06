/**
 * Parser para listas de jugadores de WhatsApp
 *
 * Formato típico de entrada:
 * ```
 * Summer cup
 * Fecha 7/9
 * 👉 sede TATAMI👈
 *
 *  1.⁠ ⁠Chuchak
 *  2.⁠ ⁠Tala
 *  3.⁠ ⁠🦈
 * ...
 * Dudas:
 * Bajas:
 * ```
 */

export interface ParsedEntry {
  lineNumber: number
  rawName: string
  normalizedName: string
}

export type SeasonType = 'apertura' | 'clausura' | 'summer'

export interface ParsedHeader {
  seasonType: SeasonType | null
  eventNumber: number | null
  totalEvents: number | null
}

// Caracteres Unicode invisibles comunes en WhatsApp
const INVISIBLE_CHARS = /[\u2060\u200B\u200C\u200D\uFEFF\u00A0]/g

// Patrón para detectar líneas numeradas (1., 2., 10., etc.)
const NUMBERED_LINE_PATTERN = /^\s*(\d{1,2})\.\s*/

// Secciones que terminan la lista de jugadores
const STOP_SECTIONS = ['dudas:', 'bajas:', 'baja:', 'duda:']

/**
 * Normaliza un nombre removiendo caracteres invisibles y espacios extra
 */
function normalizeName(raw: string): string {
  return raw
    .replace(INVISIBLE_CHARS, '') // Remover caracteres invisibles
    .replace(/\s+/g, ' ') // Colapsar espacios múltiples
    .trim()
}

/**
 * Determina si una línea es el inicio de una sección de stop
 */
function isStopSection(line: string): boolean {
  const lower = line.toLowerCase().trim()
  return STOP_SECTIONS.some((section) => lower.startsWith(section))
}

/**
 * Parsea una lista de WhatsApp y extrae los nombres de jugadores
 *
 * @param text - Texto pegado desde WhatsApp
 * @returns Array de entradas parseadas
 */
export function parseWhatsAppList(text: string): ParsedEntry[] {
  const lines = text.split('\n')
  const entries: ParsedEntry[] = []
  let foundFirstNumber = false

  for (const line of lines) {
    // Si encontramos una sección de stop, terminamos
    if (isStopSection(line)) {
      break
    }

    // Buscar línea numerada
    const match = line.match(NUMBERED_LINE_PATTERN)

    if (match && match[1]) {
      foundFirstNumber = true
      const lineNumber = parseInt(match[1], 10)
      const rawName = line.replace(NUMBERED_LINE_PATTERN, '')
      const normalizedName = normalizeName(rawName)

      // Solo agregar si hay un nombre (no línea vacía tipo "16. ")
      if (normalizedName.length > 0) {
        entries.push({
          lineNumber,
          rawName: rawName.trim(),
          normalizedName,
        })
      }
    }
    // Si ya encontramos números pero esta línea no tiene número,
    // podría ser continuación o fin del bloque
    else if (foundFirstNumber && line.trim().length > 0) {
      // Ignorar líneas que no son numeradas después de empezar
      // (podrían ser comentarios o notas)
      continue
    }
  }

  return entries
}

/**
 * Extrae solo los nombres normalizados de la lista
 */
export function extractNames(text: string): string[] {
  return parseWhatsAppList(text).map((entry) => entry.normalizedName)
}

// Patrones para detectar tipo de temporada
const SEASON_PATTERNS: Array<{ pattern: RegExp; type: SeasonType }> = [
  { pattern: /summer\s*cup/i, type: 'summer' },
  { pattern: /summer/i, type: 'summer' },
  { pattern: /apertura/i, type: 'apertura' },
  { pattern: /clausura/i, type: 'clausura' },
]

// Patron para "Fecha N/M" donde N = numero de evento, M = total
const EVENT_NUMBER_PATTERN = /fecha\s*(\d{1,2})(?:\s*[\/de]\s*(\d{1,2}))?/i

/**
 * Parsea el header de WhatsApp para extraer informacion del torneo
 *
 * @param text - Texto completo pegado desde WhatsApp
 * @returns Informacion del header (seasonType, eventNumber, totalEvents)
 *
 * @example
 * parseWhatsAppHeader("Summer cup\nFecha 7/9\n...")
 * // { seasonType: 'summer', eventNumber: 7, totalEvents: 9 }
 */
export function parseWhatsAppHeader(text: string): ParsedHeader {
  const result: ParsedHeader = {
    seasonType: null,
    eventNumber: null,
    totalEvents: null,
  }

  // Solo analizar las primeras 10 lineas (header)
  const headerLines = text.split('\n').slice(0, 10).join('\n')

  // Buscar tipo de temporada
  for (const { pattern, type } of SEASON_PATTERNS) {
    if (pattern.test(headerLines)) {
      result.seasonType = type
      break
    }
  }

  // Buscar numero de evento
  const eventMatch = headerLines.match(EVENT_NUMBER_PATTERN)
  if (eventMatch && eventMatch[1]) {
    result.eventNumber = parseInt(eventMatch[1], 10)
    if (eventMatch[2]) {
      result.totalEvents = parseInt(eventMatch[2], 10)
    }
  }

  // Si no vino el total pero conocemos el tipo de torneo, usar el total fijo
  if (result.seasonType && result.eventNumber && result.totalEvents === null) {
    switch (result.seasonType) {
      case 'apertura':
      case 'clausura':
        result.totalEvents = 20
        break
      case 'summer':
        result.totalEvents = 9
        break
    }
  }

  return result
}
