import { useState } from 'react'
import type { LivePlayer } from '@lagranja/types'
import { ConfirmButton } from './ConfirmButton'

interface PlayerListProps {
  players: LivePlayer[]
  onEliminate: (id: string) => void
  onRebuy: (id: string) => void
  onRemove: (id: string) => void
}

export function PlayerList({ players, onEliminate, onRebuy, onRemove }: PlayerListProps) {
  const [removeDropdownOpen, setRemoveDropdownOpen] = useState(false)

  // Activos ordenados alfabéticamente
  const activePlayers = players
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  // Eliminados ordenados por orden de eliminación (position más alto = eliminado primero = #1)
  const eliminatedPlayers = players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.position ?? 0) - (a.position ?? 0))

  return (
    <div className="space-y-6">
      {/* Jugadores activos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">
            Activos ({activePlayers.length})
          </h3>

          {/* Dropdown para remover jugador que no vino */}
          {activePlayers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setRemoveDropdownOpen(!removeDropdownOpen)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
              >
                No vino ▾
              </button>

              {removeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {activePlayers.map((player) => (
                    <button
                      key={player.id!}
                      onClick={() => {
                        onRemove(player.id!)
                        setRemoveDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {activePlayers.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay jugadores registrados</p>
          ) : (
            activePlayers.map((player) => (
              <div
                key={player.id!}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{player.name}</span>
                  {player.hasRebuy && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
                      R
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!player.hasRebuy && (
                    <ConfirmButton
                      onConfirm={() => onRebuy(player.id!)}
                      label="Rebuy"
                      confirmLabel="¿Rebuy?"
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm text-white"
                      confirmClassName="px-3 py-1 bg-yellow-400 text-black rounded text-sm font-bold animate-pulse"
                    />
                  )}
                  <ConfirmButton
                    onConfirm={() => onEliminate(player.id!)}
                    label="OUT"
                    confirmLabel="¿OUT?"
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm text-white"
                    confirmClassName="px-3 py-1 bg-red-400 text-white rounded text-sm font-bold animate-pulse"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Jugadores eliminados */}
      {eliminatedPlayers.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-400 mb-3">
            Eliminados ({eliminatedPlayers.length})
          </h3>
          <div className="space-y-2">
            {eliminatedPlayers.map((player, index) => (
              <div
                key={player.id!}
                className="flex items-center justify-between bg-gray-900 rounded-lg p-3 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-sm w-6">
                    #{index + 1}
                  </span>
                  <span className="text-gray-400">{player.name}</span>
                  {player.hasRebuy && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                      R
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemove(player.id!)}
                  className="text-gray-600 hover:text-red-500 text-sm"
                  title="Quitar de la lista"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
