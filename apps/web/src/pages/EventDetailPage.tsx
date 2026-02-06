import { useParams, Link } from 'react-router-dom'
import { useEventResults } from '../hooks/useEventResults'
import { formatPoints } from '../utils/formatPoints'

export function EventDetailPage() {
  const { seasonId, eventId } = useParams()
  const { event, results, loading, error } = useEventResults(eventId)

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to={`/historial/${seasonId}`} className="text-gray-400 hover:text-white text-sm">
          ← Volver a la temporada
        </Link>
        <div className="text-gray-400">Cargando resultados...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to={`/historial/${seasonId}`} className="text-gray-400 hover:text-white text-sm">
          ← Volver a la temporada
        </Link>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Link to={`/historial/${seasonId}`} className="text-gray-400 hover:text-white text-sm">
          ← Volver a la temporada
        </Link>
        <div className="text-gray-400">Fecha no encontrada</div>
      </div>
    )
  }

  // Calcular totales
  const totalPlayers = results.length
  const totalRebuys = results.reduce((sum, r) => sum + r.rebuys, 0)
  const totalPrize = results.reduce((sum, r) => sum + r.prize, 0)

  const podium =
    results.length >= 3
      ? {
          first: results[0]!,
          second: results[1]!,
          third: results[2]!,
        }
      : null

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/historial/${seasonId}`} className="text-gray-400 hover:text-white text-sm">
          ← Volver a {event.seasonName}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Fecha #{event.number}</h1>
        <p className="text-gray-400">
          {event.date.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Podio */}
      {podium && (
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 text-center">Podio</h2>
          <div className="flex justify-center items-end gap-4">
            {/* 2° puesto */}
            <div className="text-center">
              <div className="bg-gray-600 rounded-lg p-4 mb-2">
                <div className="text-3xl">🥈</div>
              </div>
              <Link
                to={`/jugadores/${podium.second.player.id}`}
                className="font-medium hover:text-green-400 transition"
              >
                {podium.second.player.name}
              </Link>
              <div className="text-sm text-gray-400">{formatPoints(podium.second.points)} pts</div>
            </div>

            {/* 1° puesto */}
            <div className="text-center -mb-4">
              <div className="bg-yellow-900/30 rounded-lg p-6 mb-2 border border-yellow-700">
                <div className="text-5xl">🥇</div>
              </div>
              <Link
                to={`/jugadores/${podium.first.player.id}`}
                className="font-bold text-yellow-400 hover:text-yellow-300 transition"
              >
                {podium.first.player.name}
              </Link>
              <div className="text-sm text-yellow-500">{formatPoints(podium.first.points)} pts</div>
            </div>

            {/* 3° puesto */}
            <div className="text-center">
              <div className="bg-orange-900/30 rounded-lg p-4 mb-2">
                <div className="text-3xl">🥉</div>
              </div>
              <Link
                to={`/jugadores/${podium.third.player.id}`}
                className="font-medium hover:text-green-400 transition"
              >
                {podium.third.player.name}
              </Link>
              <div className="text-sm text-gray-400">{formatPoints(podium.third.points)} pts</div>
            </div>
          </div>
        </section>
      )}

      {/* Stats resumen */}
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalPlayers}</div>
          <div className="text-sm text-gray-400">Jugadores</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{totalRebuys}</div>
          <div className="text-sm text-gray-400">Recompras</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            ${totalPrize.toLocaleString('es-AR')}
          </div>
          <div className="text-sm text-gray-400">Pozo Total</div>
        </div>
      </section>

      {/* Tabla de resultados */}
      <section className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-300">#</th>
              <th className="px-4 py-3 text-left text-sm text-gray-300">Jugador</th>
              <th className="px-4 py-3 text-center text-sm text-gray-300">Pts</th>
              <th className="px-4 py-3 text-center text-sm text-gray-300" title="Recompras">R</th>
              <th className="px-4 py-3 text-right text-sm text-gray-300">Premio</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((r) => (
                <tr
                  key={r.player.id}
                  className={`border-t border-gray-700 hover:bg-gray-700/50 transition ${getRowClass(r.position)}`}
                >
                  <td className="px-4 py-3">
                    <span className={getPositionClass(r.position)}>{r.position}°</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/jugadores/${r.player.id}`}
                      className="hover:text-green-400 transition"
                    >
                      {r.player.name}
                    </Link>
                  </td>
                  <td className={`px-4 py-3 text-center font-medium ${getPointsClass(r.points)}`}>
                    {formatPoints(r.points)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {r.rebuys > 0 ? r.rebuys : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {r.prize > 0 ? `$${r.prize.toLocaleString('es-AR')}` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-400" colSpan={5}>
                  No hay resultados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function getPositionClass(position: number): string {
  if (position === 1) return 'font-bold text-yellow-400'
  if (position === 2) return 'font-medium text-gray-300'
  if (position === 3) return 'font-medium text-orange-400'
  return 'text-gray-400'
}

function getPointsClass(points: number): string {
  if (points >= 16) return 'text-yellow-400' // 1°
  if (points >= 10) return 'text-gray-300'   // 2°
  if (points >= 7) return 'text-orange-400'  // 3°
  if (points >= 4) return 'text-blue-400'    // 4°
  if (points >= 2) return 'text-purple-400'  // 5°
  return 'text-gray-500'
}

function getRowClass(position: number): string {
  if (position <= 5) return 'bg-green-900/5'
  return ''
}
