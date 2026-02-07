import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useHallOfFame } from '../hooks/useHallOfFame'
import { GlassCard, CardSkeleton, PageHeader } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem, staggerFast, tableRow } from '../lib/motion'

export function HallOfFamePage() {
  const { champions, shame, loading, error } = useHallOfFame()

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Hall of Fame" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader title="Hall of Fame" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
    )
  }

  const finalSevens = champions.filter((c) => c.tournamentType === 'final_seven')
  const summerChampions = champions.filter((c) => c.tournamentType === 'summer_cup' || c.tournamentType === 'summer')
  const fracas = champions.filter((c) => c.tournamentType === 'fraca')

  const hofGroups = groupByTitles(finalSevens)

  return (
    <div className="space-y-10">
      <PageHeader title="Hall of Fame" />

      {/* Hall of Fame - Final Seven */}
      {finalSevens.length > 0 && (
        <motion.section className="space-y-8" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-gold">Hall of Fame (Final Seven)</h2>

          {hofGroups.tri.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gold mb-4">TRIHOF</h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.tri.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofCard player={player} badge="TRIHOF" highlight />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {hofGroups.bi.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gold/70 mb-4">BIHOF</h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.bi.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofCard player={player} badge="BIHOF" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {hofGroups.rest.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-widest text-text-tertiary mb-4">HOF</h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.rest.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofCard player={player} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </motion.section>
      )}

      {/* Summer Champions */}
      {summerChampions.length > 0 && (
        <motion.section className="space-y-4" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-blue-400">Summer Champions</h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {summerChampions
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <motion.div key={entry.id} variants={staggerItem}>
                  <ChampionCard entry={entry} />
                </motion.div>
              ))}
          </motion.div>
        </motion.section>
      )}

      {/* Fraca Champions */}
      {fracas.length > 0 && (
        <motion.section className="space-y-4" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-purple-400">Fraca</h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {fracas
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <motion.div key={entry.id} variants={staggerItem}>
                  <ChampionCard entry={entry} />
                </motion.div>
              ))}
          </motion.div>
        </motion.section>
      )}

      {champions.length === 0 && (
        <GlassCard className="p-8 text-center text-text-secondary">
          No hay campeones registrados
        </GlassCard>
      )}

      {/* Hall of Shame */}
      <motion.section className="mt-4" variants={fadeIn} initial="initial" animate="animate">
        <h2 className="text-xl font-medium text-accent-light mb-4">Hall of Shame</h2>
        <div className="bg-glass border border-glass-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-2/80 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-text-tertiary">Título</th>
                <th className="px-4 py-3 text-left text-sm text-text-tertiary">Jugador</th>
                <th className="px-4 py-3 text-right text-sm text-text-tertiary">Cantidad</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerFast} initial="initial" animate="animate">
              {shame.map((entry) => (
                <motion.tr
                  key={entry.title}
                  variants={tableRow}
                  className="border-t border-glass-border hover:bg-glass-hover transition"
                >
                  <td className="px-4 py-3">{entry.title}</td>
                  <td className="px-4 py-3">
                    {entry.playerId ? (
                      <Link
                        to={`/jugadores/${entry.playerId}`}
                        className="text-text-secondary hover:text-accent-light transition"
                      >
                        {entry.playerName}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">{entry.playerName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-accent-light">{entry.count}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.section>
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
  return (
    <GlassCard className={`p-4 text-center ${highlight ? 'ring-1 ring-gold/50 shadow-gold-glow' : ''}`}>
      <div className="w-16 h-16 mx-auto rounded-full bg-surface-3 flex items-center justify-center overflow-hidden text-2xl">
        {player.avatarUrl ? (
          <img src={player.avatarUrl} alt={player.playerName} className="w-full h-full object-cover" />
        ) : (
          '🐵'
        )}
      </div>
      <div className="mt-3 font-semibold">{player.playerName}</div>
      {badge && (
        <motion.div
          className="mt-1 text-xs tracking-widest text-gold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {badge}
        </motion.div>
      )}
      <div className="mt-2 text-xs text-text-tertiary">{player.seasons.join(', ')}</div>
    </GlassCard>
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
    <GlassCard className="p-4 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-surface-3 flex items-center justify-center overflow-hidden text-2xl">
        {entry.playerAvatarUrl ? (
          <img src={entry.playerAvatarUrl} alt={entry.playerName} className="w-full h-full object-cover" />
        ) : (
          '🐵'
        )}
      </div>
      <div className="mt-3 font-semibold">{entry.playerName}</div>
      <div className="mt-1 text-xs text-text-tertiary">{entry.seasonName ?? entry.year}</div>
    </GlassCard>
  )
}
