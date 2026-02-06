import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'

export function JugadoresPage() {
  const { players, loading, error } = usePlayers()
  const [search, setSearch] = useState('')

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nickname?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <div className="text-gray-400">Cargando jugadores...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Jugadores</h1>

      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre o alias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Contador */}
      <p className="text-gray-500 text-sm">
        {filtered.length} jugador{filtered.length !== 1 ? 'es' : ''}
        {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grid de jugadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((player) => (
          <Link
            key={player.id}
            to={`/jugadores/${player.id}`}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '🐵'
              )}
            </div>
            <div>
              <div className="font-medium">{player.name}</div>
              {player.nickname && (
                <div className="text-gray-400 text-sm">"{player.nickname}"</div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron jugadores
        </div>
      )}
    </div>
  )
}
