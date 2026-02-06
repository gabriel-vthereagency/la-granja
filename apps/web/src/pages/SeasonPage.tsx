import { useParams, Link } from 'react-router-dom'
import { useSeason } from '../hooks/useSeason'
import { useSeasonEvents } from '../hooks/useSeasonEvents'
import { useStandings } from '../hooks/useStandings'
import { StandingsTable } from '../components/StandingsTable'

export function SeasonPage() {
  const { seasonId } = useParams()
  const { season, champions, loading: seasonLoading, error: seasonError } = useSeason(seasonId)
  const { events, loading: eventsLoading } = useSeasonEvents(seasonId)
  const { standings, loading: standingsLoading, error: standingsError } = useStandings(seasonId ?? null)

  const loading = seasonLoading || eventsLoading || standingsLoading
  const error = seasonError || standingsError

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/historial" className="text-gray-400 hover:text-white text-sm">
          ← Volver al historial
        </Link>
        <div className="text-gray-400">Cargando temporada...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/historial" className="text-gray-400 hover:text-white text-sm">
          ← Volver al historial
        </Link>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="space-y-6">
        <Link to="/historial" className="text-gray-400 hover:text-white text-sm">
          ← Volver al historial
        </Link>
        <div className="text-gray-400">Temporada no encontrada</div>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    active: 'En curso',
    finished: 'Finalizado',
    upcoming: 'Próximo',
  }

  const regularChampion = champions.regular ?? standings[0]?.player ?? null
  const isSummer = season.type === 'summer'

  return (
    <div className="space-y-6">
      <div>
        <Link to="/historial" className="text-gray-400 hover:text-white text-sm">
          ← Volver al historial
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{season.name}</h1>
        <p className="text-gray-400">
          {statusLabel[season.status] ?? season.status}
          {season.finishedEvents > 0 && ` • ${season.finishedEvents} fecha${season.finishedEvents !== 1 ? 's' : ''} jugada${season.finishedEvents !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Header de campeones */}
      {season.status === 'finished' && (
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Campeones</h2>
          {isSummer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <ChampionCard
                title="Temporada Regular"
                player={regularChampion}
                highlight={false}
              />
              <ChampionCard
                title="Summer Champion"
                player={champions.summerChampion}
                highlight={true}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <ChampionCard
                title="Final Seven"
                player={champions.finalSeven}
                highlight={true}
              />
              <ChampionCard
                title="Temporada Regular"
                player={regularChampion}
                highlight={false}
              />
              <ChampionCard
                title="Fraca"
                player={champions.fraca}
                highlight={false}
              />
            </div>
          )}
        </section>
      )}

      {/* Tabla de posiciones */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">
          {season.status === 'finished' ? 'Tabla Final' : 'Tabla de Posiciones'}
        </h2>
        {standings.length > 0 ? (
          <StandingsTable
            standings={standings}
            currentEvent={season.finishedEvents}
            totalEvents={season.totalEvents || undefined}
          />
        ) : (
          <div className="text-gray-400 text-center py-8">
            No hay resultados registrados
          </div>
        )}
      </section>

      {/* Lista de fechas */}
      {events.length > 0 && (
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Fechas</h2>
          <div className="grid gap-2">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/historial/${seasonId}/${event.id}`}
                className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-300">#{event.number}</span>
                  <span className="text-gray-400">
                    {event.date.toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <EventStatusBadge status={event.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ChampionCard({
  title,
  player,
  highlight,
}: {
  title: string
  player: { name: string; id: string } | null
  highlight: boolean
}) {
  const bgClass = highlight ? 'bg-yellow-900/20' : ''
  const titleClass = highlight ? 'text-yellow-500' : 'text-gray-400'
  const nameClass = highlight ? 'font-bold text-yellow-400' : 'font-medium'

  return (
    <div className={`${bgClass} rounded p-3`}>
      <div className={`text-sm ${titleClass}`}>{title}</div>
      {player ? (
        <Link
          to={`/jugadores/${player.id}`}
          className={`${nameClass} hover:underline`}
        >
          {player.name}
        </Link>
      ) : (
        <div className="text-gray-500">-</div>
      )}
    </div>
  )
}

function EventStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { label: string; class: string }> = {
    finished: { label: 'Finalizado', class: 'bg-gray-600 text-gray-300' },
    live: { label: 'En vivo', class: 'bg-green-600 text-white' },
    scheduled: { label: 'Próximo', class: 'bg-blue-600 text-white' },
  }

  const style = styles[status] ?? { label: status, class: 'bg-gray-700' }

  return (
    <span className={`px-2 py-1 rounded text-xs ${style.class}`}>
      {style.label}
    </span>
  )
}
