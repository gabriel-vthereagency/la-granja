import { Link } from 'react-router-dom'
import { useSeasons } from '../hooks/useSeasons'
import { useStandings } from '../hooks/useStandings'
import { useLastPodium } from '../hooks/useLastPodium'
import { StandingsTable } from '../components/StandingsTable'

export function HomePage() {
  const { activeSeason, loading: seasonsLoading } = useSeasons()
  const { standings, loading: standingsLoading } = useStandings(activeSeason?.id ?? null)
  const { podium, eventNumber, loading: podiumLoading } = useLastPodium(activeSeason?.id ?? null)

  const isLoading = seasonsLoading || standingsLoading || podiumLoading

  // Reordenar podio: [2°, 1°, 3°] para display
  const podiumDisplay = podium.length === 3
    ? [podium[1], podium[0], podium[2]] // 2°, 1°, 3°
    : podium

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8 md:py-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg">
        <h1 className="sr-only">La Granja Poker</h1>
        <img
          src="/logo%20vertical.png"
          alt="La Granja Poker"
          className="mx-auto mb-3 w-full max-w-[220px] md:max-w-[260px]"
        />
        <p className="text-lg md:text-xl text-gray-300 italic">
          "No tratés de entenderla, disfrutála"
        </p>

        {/* Podio de la última fecha */}
        {!podiumLoading && podium.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Podio Fecha #{eventNumber}
            </p>
            <div className="flex justify-center items-end gap-4 md:gap-8">
              {podiumDisplay.map((entry, idx) => entry && (
                <PodiumSlot
                  key={entry.player.id}
                  position={entry.position}
                  name={entry.player.name}
                  isCenter={idx === 1}
                />
              ))}
            </div>
          </div>
        )}

        {podiumLoading && (
          <div className="mt-8 text-gray-500">Cargando podio...</div>
        )}
      </section>

      {/* Tabla del torneo actual */}
      <section>
        {isLoading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            Cargando tabla de posiciones...
          </div>
        ) : standings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            No hay resultados registrados para esta temporada
          </div>
        ) : (
          <StandingsTable
            standings={standings}
            seasonName={activeSeason?.name}
            currentEvent={eventNumber ?? undefined}
            totalEvents={activeSeason?.totalEvents}
          />
        )}
      </section>

      {/* Cards de navegación */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/hall-of-fame"
          className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-lg p-6 hover:border-yellow-600 transition"
        >
          <h3 className="text-xl font-bold text-yellow-500 mb-2">Hall of Fame</h3>
          <p className="text-gray-400">Los campeones de La Granja</p>
        </Link>
        <Link
          to="/jugadores"
          className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-6 hover:border-green-600 transition"
        >
          <h3 className="text-xl font-bold text-red-500 mb-2">Jugadores</h3>
          <p className="text-gray-400">Directorio y perfiles</p>
        </Link>
      </section>
    </div>
  )
}

function PodiumSlot({
  position,
  name,
  isCenter,
}: {
  position: number
  name: string
  isCenter: boolean
}) {
  const positionStyles = {
    1: { ring: 'ring-yellow-500', text: 'text-yellow-500', size: 'w-20 h-20 md:w-24 md:h-24' },
    2: { ring: 'ring-gray-400', text: 'text-gray-300', size: 'w-16 h-16 md:w-20 md:h-20' },
    3: { ring: 'ring-orange-500', text: 'text-orange-400', size: 'w-16 h-16 md:w-20 md:h-20' },
  }

  const style = positionStyles[position as 1 | 2 | 3] ?? positionStyles[3]

  return (
    <div className={`text-center ${isCenter ? '-mt-4' : ''}`}>
      <div
        className={`${style.size} bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl md:text-3xl ${isCenter ? `ring-4 ${style.ring}` : ''}`}
      >
        🐵
      </div>
      <div className={`font-bold ${style.text}`}>{position}°</div>
      <div className="text-sm text-gray-400 max-w-[80px] truncate">{name}</div>
    </div>
  )
}
