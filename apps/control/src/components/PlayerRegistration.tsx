import { useState, useMemo } from 'react'
import type { Player, LivePlayer } from '@lagranja/types'
import {
  parseWhatsAppList,
  parseWhatsAppHeader,
  matchPlayers,
  splitMatchResults,
  type MatchResult,
  type ParsedEntry,
  type ParsedHeader,
  type SeasonType,
} from '@lagranja/core'
import { usePlayers } from '../hooks/usePlayers'
import { useSeasons } from '../hooks/useSeasons'

interface PlayerRegistrationProps {
  /** Jugadores ya registrados en el torneo actual */
  registeredPlayers: LivePlayer[]
  /** Callback cuando se confirman los registros */
  onRegister: (
    players: Array<{ player: Player; displayName: string }>,
    tournamentInfo: TournamentInfo
  ) => void
  /** Callback para cerrar el modal */
  onClose: () => void
}

type RegistrationState = 'input' | 'review'

interface UnmatchedResolution {
  entry: ParsedEntry
  resolution:
    | { type: 'existing'; player: Player; saveAlias: boolean }
    | { type: 'new'; officialName: string }
    | null
}

type TournamentInfo = {
  eventId?: string | null
  tournamentName?: string | null
  seasonName?: string | null
  eventNumber?: number | null
  totalEvents?: number | null
}

export function PlayerRegistration({
  registeredPlayers,
  onRegister,
  onClose,
}: PlayerRegistrationProps) {
  const { players, aliases, loading, createPlayer, createAlias } = usePlayers()
  const { resolveEvent } = useSeasons()

  const [state, setState] = useState<RegistrationState>('input')
  const [inputText, setInputText] = useState('')
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [unmatchedResolutions, setUnmatchedResolutions] = useState<UnmatchedResolution[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedHeader, setDetectedHeader] = useState<ParsedHeader | null>(null)

  // IDs de jugadores ya en el torneo
  const alreadyRegisteredIds = useMemo(
    () => registeredPlayers.map((p) => p.playerId),
    [registeredPlayers]
  )

  // Procesar lista pegada
  const handleParse = () => {
    const entries = parseWhatsAppList(inputText)

    if (entries.length === 0) {
      return
    }

    // Parsear header para detectar torneo/fecha
    const header = parseWhatsAppHeader(inputText)
    setDetectedHeader(header)

    const results = matchPlayers(entries, {
      players,
      aliases,
      alreadyRegistered: alreadyRegisteredIds,
    })

    const { unmatched } = splitMatchResults(results)

    setMatchResults(results)
    setUnmatchedResolutions(
      unmatched.map((r) => ({ entry: r.entry, resolution: null }))
    )
    setState('review')
  }

  // Resolver un jugador no matcheado
  const resolveUnmatched = (
    index: number,
    resolution: UnmatchedResolution['resolution']
  ) => {
    setUnmatchedResolutions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, resolution } : item))
    )
  }

  // Verificar si todos los unmatched están resueltos
  const allResolved = unmatchedResolutions.every((r) => r.resolution !== null)

  // Confirmar registros
  const handleConfirm = async () => {
    setIsProcessing(true)

    try {
      const toRegister: Array<{ player: Player; displayName: string }> = []

      // Resolver evento si se detecto header
      const tournamentInfo: TournamentInfo = {}
      if (detectedHeader?.seasonType && detectedHeader?.eventNumber) {
        const resolved = await resolveEvent(
          detectedHeader.seasonType,
          detectedHeader.eventNumber
        )
        if (resolved) {
          tournamentInfo.eventId = resolved.event.id
          tournamentInfo.seasonName = resolved.season.name
        }
        tournamentInfo.tournamentName = getSeasonDisplayName(detectedHeader.seasonType)
        tournamentInfo.eventNumber = detectedHeader.eventNumber
        if (detectedHeader.totalEvents !== null) {
          tournamentInfo.totalEvents = detectedHeader.totalEvents
        }
      }

      // Agregar los matched directamente
      for (const result of matchResults) {
        if (result.player) {
          toRegister.push({
            player: result.player,
            displayName: result.entry.normalizedName,
          })
        }
      }

      // Procesar los unmatched resueltos
      for (const { entry, resolution } of unmatchedResolutions) {
        if (!resolution) continue

        if (resolution.type === 'existing') {
          // Usar jugador existente
          toRegister.push({
            player: resolution.player,
            displayName: entry.normalizedName,
          })

          // Guardar alias si se marco
          if (resolution.saveAlias) {
            await createAlias(resolution.player.id, entry.normalizedName)
          }
        } else if (resolution.type === 'new') {
          // Crear nuevo jugador
          const newPlayer = await createPlayer(resolution.officialName)
          if (newPlayer) {
            toRegister.push({
              player: newPlayer,
              displayName: entry.normalizedName,
            })

            // Guardar el nombre del WhatsApp como alias si es diferente
            if (
              entry.normalizedName.toLowerCase() !==
              resolution.officialName.toLowerCase()
            ) {
              await createAlias(newPlayer.id, entry.normalizedName)
            }
          }
        }
      }

      onRegister(toRegister, tournamentInfo)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-white">Cargando jugadores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-white">
            {state === 'input' ? 'Pegar Lista de WhatsApp' : 'Confirmar Jugadores'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {state === 'input' ? (
            <InputView
              value={inputText}
              onChange={setInputText}
              onSubmit={handleParse}
            />
          ) : (
            <ReviewView
              matchResults={matchResults}
              unmatchedResolutions={unmatchedResolutions}
              players={players}
              onResolve={resolveUnmatched}
              detectedHeader={detectedHeader}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          {state === 'review' && (
            <button
              onClick={() => setState('input')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              ← Volver
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Cancelar
          </button>
          {state === 'review' && (
            <button
              onClick={handleConfirm}
              disabled={!allResolved || isProcessing}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-medium"
            >
              {isProcessing ? 'Procesando...' : `Registrar ${matchResults.length} jugadores`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Vista de input
function InputView({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        Pegá la lista del grupo de WhatsApp. Se detectarán automáticamente los
        jugadores numerados.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Ejemplo:\n 1. Chuchak\n 2. Tala\n 3. 🦈\n...`}
        className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 font-mono text-sm resize-none"
        autoFocus
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-white font-medium"
      >
        Procesar Lista
      </button>
    </div>
  )
}

// Vista de review
function ReviewView({
  matchResults,
  unmatchedResolutions,
  players,
  onResolve,
  detectedHeader,
}: {
  matchResults: MatchResult[]
  unmatchedResolutions: UnmatchedResolution[]
  players: Player[]
  onResolve: (index: number, resolution: UnmatchedResolution['resolution']) => void
  detectedHeader: ParsedHeader | null
}) {
  const matched = matchResults.filter((r) => r.player !== null)

  return (
    <div className="space-y-6">
      {/* Torneo detectado */}
      {detectedHeader?.seasonType && (
        <DetectedTournament header={detectedHeader} />
      )}

      {/* Matched */}
      {matched.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-400 mb-2">
            ✓ Reconocidos ({matched.length})
          </h3>
          <div className="space-y-1">
            {matched.map((result, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm bg-gray-700/50 rounded px-3 py-2"
              >
                <span className="text-gray-400">{result.entry.normalizedName}</span>
                <span className="text-gray-600">→</span>
                <span className="text-white">{result.player!.name}</span>
                {result.confidence === 'alias' && (
                  <span className="text-xs text-gray-500">(alias)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched */}
      {unmatchedResolutions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-yellow-400 mb-2">
            ⚠ Requieren asignación ({unmatchedResolutions.length})
          </h3>
          <div className="space-y-3">
            {unmatchedResolutions.map((item, index) => (
              <UnmatchedItem
                key={index}
                entry={item.entry}
                resolution={item.resolution}
                players={players}
                onResolve={(r) => onResolve(index, r)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Item no matcheado
function UnmatchedItem({
  entry,
  resolution,
  players,
  onResolve,
}: {
  entry: ParsedEntry
  resolution: UnmatchedResolution['resolution']
  players: Player[]
  onResolve: (r: UnmatchedResolution['resolution']) => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [saveAlias, setSaveAlias] = useState(true)

  const handleSelectExisting = (player: Player) => {
    onResolve({ type: 'existing', player, saveAlias })
    setShowDropdown(false)
  }

  const handleCreateNew = () => {
    if (newName.trim()) {
      onResolve({ type: 'new', officialName: newName.trim() })
      setShowNewForm(false)
    }
  }

  if (resolution) {
    // Mostrar resolución
    return (
      <div className="flex items-center gap-2 text-sm bg-gray-700/50 rounded px-3 py-2">
        <span className="text-gray-400">{entry.normalizedName}</span>
        <span className="text-gray-600">→</span>
        <span className="text-white">
          {resolution.type === 'existing'
            ? resolution.player.name
            : `${resolution.officialName} (nuevo)`}
        </span>
        <button
          onClick={() => onResolve(null)}
          className="ml-auto text-gray-500 hover:text-white text-xs"
        >
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-700 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white font-medium">{entry.normalizedName}</span>
        <span className="text-xs text-gray-500">#{entry.lineNumber}</span>
      </div>

      {!showDropdown && !showNewForm ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowDropdown(true)}
            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
          >
            Asignar a existente
          </button>
          <button
            onClick={() => {
              setNewName(entry.normalizedName)
              setShowNewForm(true)
            }}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
          >
            Crear nuevo
          </button>
        </div>
      ) : showDropdown ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={saveAlias}
                onChange={(e) => setSaveAlias(e.target.checked)}
                className="rounded"
              />
              Guardar "{entry.normalizedName}" como alias
            </label>
          </div>
          <div className="max-h-40 overflow-y-auto bg-gray-800 rounded">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectExisting(player)}
                className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 text-sm"
              >
                {player.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDropdown(false)}
            className="text-sm text-gray-500 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            Ingresá el nombre oficial del jugador:
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre oficial"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateNew}
              disabled={!newName.trim()}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded text-sm text-white"
            >
              Crear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Mostrar torneo detectado
function DetectedTournament({ header }: { header: ParsedHeader }) {
  const seasonName = getSeasonDisplayName(header.seasonType)

  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📅</span>
        <div>
          <div className="text-white font-medium">
            {seasonName}
            {header.eventNumber && ` - Fecha #${header.eventNumber}`}
            {header.totalEvents && ` de ${header.totalEvents}`}
          </div>
          <div className="text-xs text-blue-300">
            Detectado automaticamente
          </div>
        </div>
      </div>
    </div>
  )
}

function getSeasonDisplayName(type: SeasonType | null): string {
  switch (type) {
    case 'apertura':
      return 'Apertura'
    case 'clausura':
      return 'Clausura'
    case 'summer':
      return 'Summer Cup'
    default:
      return 'Torneo'
  }
}
