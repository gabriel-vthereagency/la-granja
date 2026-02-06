import { Link } from 'react-router-dom'
import { useHallOfFame } from '../hooks/useHallOfFame'

export function HallOfFamePage() {
  const { champions, shame, loading, error } = useHallOfFame()

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Hall of Fame</h1>
        <div className="text-gray-400">Cargando campeones...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Hall of Fame</h1>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  // Group champions by tournament type for better display
  const finalSevens = champions.filter((c) => c.tournamentType === 'final_seven')
  const summerChampions = champions.filter((c) => c.tournamentType === 'summer_cup' || c.tournamentType === 'summer')
  const fracas = champions.filter((c) => c.tournamentType === 'fraca')

  const hofGroups = groupByTitles(finalSevens)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Hall of Fame</h1>

      {/* Hall of Fame - Final Seven */}
      {finalSevens.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-medium text-yellow-500">Hall of Fame (Final Seven)</h2>

          {hofGroups.tri.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-yellow-400 mb-3">TRIHOF</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hofGroups.tri.map((player) => (
                  <HofCard key={player.playerId} player={player} badge="TRIHOF" highlight />
                ))}
              </div>
            </div>
          )}

          {hofGroups.bi.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-yellow-300 mb-3">BIHOF</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hofGroups.bi.map((player) => (
                  <HofCard key={player.playerId} player={player} badge="BIHOF" />
                ))}
              </div>
            </div>
          )}

          {hofGroups.rest.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">HOF</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {hofGroups.rest.map((player) => (
                  <HofCard key={player.playerId} player={player} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Summer Champions */}
      {summerChampions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-blue-400">Summer Champions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summerChampions
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <ChampionCard key={entry.id} entry={entry} />
              ))}
          </div>
        </section>
      )}

      {/* Fraca Champions */}
      {fracas.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-purple-400">Fraca</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fracas
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <ChampionCard key={entry.id} entry={entry} />
              ))}
          </div>
        </section>
      )}

      {champions.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          No hay campeones registrados
        </div>
      )}

      {/* Hall of Shame */}
      <section className="mt-12">
        <h2 className="text-xl font-medium text-red-400 mb-4">Hall of Shame</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-300">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-sm text-gray-300">
                  Jugador
                </th>
                <th className="px-4 py-3 text-right text-sm text-gray-300">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody>
              {shame.map((entry) => (
                <tr key={entry.title} className="border-t border-gray-700">
                  <td className="px-4 py-3">{entry.title}</td>
                  <td className="px-4 py-3">
                    {entry.playerId ? (
                      <Link
                        to={`/jugadores/${entry.playerId}`}
                        className="text-gray-400 hover:text-green-400 transition"
                      >
                        {entry.playerName}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{entry.playerName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-red-400">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

type HofPlayerGroup = {
  playerId: string
  playerName: string
  avatarUrl: string | null
  titles: number
  seasons: string[]
}

function groupByTitles(entries: {
  playerId: string
  playerName: string
  playerAvatarUrl: string | null
  year: number
  seasonName: string | null
}[]) {
  const byPlayer = new Map<string, HofPlayerGroup>()
  for (const entry of entries) {
    const current = byPlayer.get(entry.playerId) ?? {
      playerId: entry.playerId,
      playerName: entry.playerName,
      avatarUrl: entry.playerAvatarUrl ?? null,
      seasons: [],
      titles: 0,
    }
    const label = entry.seasonName ?? entry.year.toString()
    current.seasons.push(label)
    current.titles += 1
    byPlayer.set(entry.playerId, current)
  }

  const all = Array.from(byPlayer.values()).map((player) => ({
    ...player,
    seasons: player.seasons.slice().sort((a, b) => b.localeCompare(a)),
  }))

  const tri = all.filter((p) => p.titles >= 3).sort((a, b) => b.titles - a.titles)
  const bi = all.filter((p) => p.titles === 2).sort((a, b) => a.playerName.localeCompare(b.playerName))
  const rest = all
    .filter((p) => p.titles === 1)
    .sort((a, b) => (b.seasons[0] ?? '').localeCompare(a.seasons[0] ?? ''))

  return { tri, bi, rest }
}

function HofCard({
  player,
  badge,
  highlight = false,
}: {
  player: HofPlayerGroup
  badge?: string
  highlight?: boolean
}) {
  const ring = highlight ? 'ring-2 ring-yellow-500/70' : 'ring-1 ring-gray-700'
  return (
    <div className={`bg-gray-800 rounded-xl p-4 text-center ${ring}`}>
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-700 flex items-center justify-center overflow-hidden text-2xl">
        {player.avatarUrl ? (
          <img src={player.avatarUrl} alt={player.playerName} className="w-full h-full object-cover" />
        ) : (
          '🐵'
        )}
      </div>
      <div className="mt-3 font-semibold">{player.playerName}</div>
      {badge && (
        <div className="mt-1 text-xs tracking-widest text-yellow-400">{badge}</div>
      )}
      <div className="mt-2 text-xs text-gray-400">{player.seasons.join(', ')}</div>
    </div>
  )
}

function ChampionCard({
  entry,
}: {
  entry: {
    year: number
    playerName: string
    playerId: string
    playerAvatarUrl: string | null
    seasonName: string | null
  }
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center ring-1 ring-gray-700">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-700 flex items-center justify-center overflow-hidden text-2xl">
        {entry.playerAvatarUrl ? (
          <img src={entry.playerAvatarUrl} alt={entry.playerName} className="w-full h-full object-cover" />
        ) : (
          '🐵'
        )}
      </div>
      <div className="mt-3 font-semibold">{entry.playerName}</div>
      <div className="mt-1 text-xs text-gray-400">{entry.seasonName ?? entry.year}</div>
    </div>
  )
}
