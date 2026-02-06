import { useParams, Link } from 'react-router-dom'
import { usePlayerProfile } from '../hooks/usePlayerProfile'
import { formatPoints } from '../utils/formatPoints'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const { profile, loading, error } = usePlayerProfile(playerId)

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/jugadores" className="text-gray-400 hover:text-white text-sm">
          ← Volver a jugadores
        </Link>
        <div className="text-gray-400">Cargando perfil...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Link to="/jugadores" className="text-gray-400 hover:text-white text-sm">
          ← Volver a jugadores
        </Link>
        <div className="text-red-400">
          {error ?? 'Jugador no encontrado'}
        </div>
      </div>
    )
  }

  const { player, aliases, favoriteHand, memberSince, stats } = profile

  return (
    <div className="space-y-6">
      <div>
        <Link to="/jugadores" className="text-gray-400 hover:text-white text-sm">
          ← Volver a jugadores
        </Link>
      </div>

      {/* Header del perfil */}
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-5xl shrink-0">
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
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{player.name}</h1>
          {player.nickname && (
            <p className="text-gray-400">"{player.nickname}"</p>
          )}
          {aliases.length > 0 && (
            <p className="text-gray-500 text-sm">
              Aliases: {aliases.join(', ')}
            </p>
          )}
          {favoriteHand && (
            <p className="text-gray-500 text-sm italic mt-2">
              Mano favorita: {favoriteHand}
            </p>
          )}
        </div>
      </div>

      {/* Badges HOF - TODO: reemplazar por PNGs */}
      {stats.finalSevens > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge label={`${stats.finalSevens}x Final Seven`} color="bg-purple-700" />
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Miembro desde"
          value={memberSince ? formatDate(memberSince) : '-'}
        />
        <StatCard
          label="Fechas jugadas"
          value={stats.totalEvents.toString()}
        />
        <StatCard
          label="Puntos totales"
          value={formatPoints(stats.totalPoints)}
          color="text-green-400"
        />
        <StatCard
          label="Efectividad"
          value={stats.effectiveness.toFixed(2)}
          color="text-blue-400"
        />
      </div>

      {/* Posiciones */}
      <div>
        <h2 className="text-lg font-medium mb-3 text-gray-300">Posiciones</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <StatCard label="🥇 Oros" value={stats.golds.toString()} color="text-yellow-500" />
          <StatCard label="🥈 Platas" value={stats.silvers.toString()} color="text-gray-300" />
          <StatCard label="🥉 Bronces" value={stats.bronzes.toString()} color="text-orange-400" />
          <StatCard label="4°" value={stats.fourths.toString()} color="text-gray-400" />
          <StatCard label="5°" value={stats.fifths.toString()} color="text-gray-400" />
          <StatCard label="6° Burbuja" value={stats.bubbles.toString()} color="text-gray-500" />
        </div>
      </div>

      {/* Otros stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Mesas finales"
          value={stats.finalTables.toString()}
          color="text-purple-400"
        />
        <StatCard
          label="Últimos puestos"
          value={stats.lastPlaces.toString()}
          color="text-red-400"
        />
        <StatCard
          label="Podios (top 5)"
          value={(stats.golds + stats.silvers + stats.bronzes + stats.fourths + stats.fifths).toString()}
          color="text-blue-400"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color = 'text-white',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`px-3 py-1 ${color} rounded-full text-sm text-white`}>
      {label}
    </span>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  })
}
