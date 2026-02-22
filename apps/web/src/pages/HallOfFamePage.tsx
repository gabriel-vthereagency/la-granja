import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useHallOfFame } from '../hooks/useHallOfFame'
import { GlassCard, PageHeader, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem, staggerFast, tableRow } from '../lib/motion'

const MONO_PHOTOS = ['/Players/mono1.png', '/Players/mono2.png', '/Players/mono-3.png']

/** Pick a deterministic mono photo based on a string key */
function getMonoFallback(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return MONO_PHOTOS[Math.abs(hash) % MONO_PHOTOS.length] ?? MONO_PHOTOS[0]!
}

function getBadgeSrc(titles: number): string {
  if (titles >= 3) return '/trifoh.png'
  if (titles === 2) return '/bihof.png'
  if (titles === 1) return '/hof.png'
  return '/mono.png'
}

interface TierConfig {
  gradient: string
  radial: string
  glow: string
  label: string
  labelColor: string
  borderHover: string
  pillBorder: string
}

type TierKey = 'tri' | 'bi' | 'hof'
type ChampionColorKey = 'purple'

const TIER_CONFIGS: Record<TierKey, TierConfig> = {
  tri: {
    gradient: 'from-yellow-500/20 via-surface-2/80 to-surface-1',
    radial: 'rgba(234,179,8,0.15)',
    glow: 'rgba(234,179,8,0.15)',
    label: 'TRIHOF',
    labelColor: 'text-gold',
    borderHover: 'hover:border-yellow-500/40',
    pillBorder: 'border-yellow-500/20',
  },
  bi: {
    gradient: 'from-zinc-400/20 via-surface-2/80 to-surface-1',
    radial: 'rgba(161,161,170,0.15)',
    glow: 'rgba(161,161,170,0.15)',
    label: 'BIHOF',
    labelColor: 'text-silver',
    borderHover: 'hover:border-zinc-400/40',
    pillBorder: 'border-zinc-400/20',
  },
  hof: {
    gradient: 'from-accent/15 via-surface-2/80 to-surface-1',
    radial: 'rgba(239,68,68,0.12)',
    glow: 'rgba(239,68,68,0.12)',
    label: 'HOF',
    labelColor: 'text-accent-light',
    borderHover: 'hover:border-accent/40',
    pillBorder: 'border-white/[0.1]',
  },
}

export function HallOfFamePage() {
  const { champions, shame, loading, error } = useHallOfFame()

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-8">
        <PageHeader title="Hall of Fame" />
        {/* Desktop skeleton */}
        <div className="hidden md:flex md:flex-wrap md:justify-center gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-3/60 animate-pulse h-[380px] w-[280px]" />
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-3/60 animate-pulse h-[110px]" />
          ))}
        </div>
      </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
      <div className="space-y-8">
        <PageHeader title="Hall of Fame" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
      </PageContainer>
    )
  }

  const finalSevens = champions.filter((c) => c.tournamentType === 'final_seven')
  const summerChampions = champions.filter((c) => c.tournamentType === 'summer_cup' || c.tournamentType === 'summer')
  const fracas = champions.filter((c) => c.tournamentType === 'fraca')

  const hofGroups = groupByTitles(finalSevens)
  const summerGroups = groupByTitles(summerChampions)
  const summerOrdered = [...summerGroups.tri, ...summerGroups.bi, ...summerGroups.rest]

  return (
    <PageContainer>
    <div className="space-y-10">
      <PageHeader title="Hall of Fame" />

      {/* Hall of Fame - Final Seven */}
      {finalSevens.length > 0 && (
        <motion.section className="space-y-8" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-gold">Hall of Fame (Final Seven)</h2>

          {hofGroups.tri.length > 0 && (
            <>
              {/* Desktop */}
              <motion.div
                className="hidden md:flex md:flex-wrap md:justify-center gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.tri.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofDesktopCard player={player} tier="tri" />
                  </motion.div>
                ))}
              </motion.div>
              {/* Mobile */}
              <motion.div
                className="md:hidden space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.tri.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofMobileCard player={player} tier="tri" />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {hofGroups.tri.length > 0 && hofGroups.bi.length > 0 && (
            <div className="border-t border-glass-border" />
          )}

          {hofGroups.bi.length > 0 && (
            <>
              {/* Desktop */}
              <motion.div
                className="hidden md:flex md:flex-wrap md:justify-center gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.bi.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofDesktopCard player={player} tier="bi" />
                  </motion.div>
                ))}
              </motion.div>
              {/* Mobile */}
              <motion.div
                className="md:hidden space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.bi.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofMobileCard player={player} tier="bi" />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {(hofGroups.tri.length > 0 || hofGroups.bi.length > 0) && hofGroups.rest.length > 0 && (
            <div className="border-t border-glass-border" />
          )}

          {hofGroups.rest.length > 0 && (
            <>
              {/* Desktop */}
              <motion.div
                className="hidden md:flex md:flex-wrap md:justify-center gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.rest.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofDesktopCard player={player} tier="hof" />
                  </motion.div>
                ))}
              </motion.div>
              {/* Mobile */}
              <motion.div
                className="md:hidden space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {hofGroups.rest.map((player) => (
                  <motion.div key={player.playerId} variants={staggerItem}>
                    <HofMobileCard player={player} tier="hof" />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.section>
      )}

      {/* Summer Champions */}
      {summerOrdered.length > 0 && (
        <motion.section className="space-y-4" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-accent-light">Summer Champions</h2>
          {/* Desktop */}
          <motion.div
            className="hidden md:flex md:flex-wrap md:justify-center gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {summerOrdered.map((player) => (
              <motion.div key={player.playerId} variants={staggerItem}>
                <SummerDesktopCard player={player} />
              </motion.div>
            ))}
          </motion.div>
          {/* Mobile */}
          <motion.div
            className="md:hidden space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {summerOrdered.map((player) => (
              <motion.div key={player.playerId} variants={staggerItem}>
                <SummerMobileCard player={player} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Fraca Champions */}
      {fracas.length > 0 && (
        <motion.section className="space-y-4" variants={fadeIn} initial="initial" animate="animate">
          <h2 className="text-xl font-medium text-purple-400">Fraca</h2>
          {/* Desktop */}
          <motion.div
            className="hidden md:flex md:flex-wrap md:justify-center gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {fracas
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <motion.div key={entry.id} variants={staggerItem}>
                  <ChampionDesktopCard entry={entry} accentColor="purple" />
                </motion.div>
              ))}
          </motion.div>
          {/* Mobile */}
          <motion.div
            className="md:hidden space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {fracas
              .slice()
              .sort((a, b) => b.year - a.year)
              .map((entry) => (
                <motion.div key={entry.id} variants={staggerItem}>
                  <ChampionMobileCard entry={entry} accentColor="purple" />
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
    </PageContainer>
  )
}

/* ─── Data helpers ─── */

type HofPlayerGroup = {
  playerId: string
  playerName: string
  avatarUrl: string | null
  titles: number
  seasons: string[]
  maxYear: number
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
      maxYear: 0,
    }
    const label = entry.seasonName ?? entry.year.toString()
    current.seasons.push(label)
    current.titles += 1
    if (entry.year > current.maxYear) current.maxYear = entry.year
    byPlayer.set(entry.playerId, current)
  }

  const all = Array.from(byPlayer.values()).map((player) => ({
    ...player,
    seasons: player.seasons.slice().sort((a, b) => b.localeCompare(a)),
  }))

  const tri = all.filter((p) => p.titles >= 3).sort((a, b) => b.titles - a.titles)
  const bi = all.filter((p) => p.titles === 2).sort((a, b) => b.maxYear - a.maxYear)
  const rest = all
    .filter((p) => p.titles === 1)
    .sort((a, b) => b.maxYear - a.maxYear)

  return { tri, bi, rest }
}

/* ─── HOF Desktop Card ─── */

function HofDesktopCard({ player, tier }: { player: HofPlayerGroup; tier: TierKey }) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${player.playerId}.png`
  const badgeSrc = getBadgeSrc(player.titles)
  const config = TIER_CONFIGS[tier]

  return (
    <Link
      to={`/jugadores/${player.playerId}`}
      className={`group relative block rounded-xl overflow-hidden border border-glass-border ${config.borderHover} transition-all duration-300 h-[380px] w-[280px]`}
    >
      {/* Tier gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${config.radial} 0%, transparent 70%)`,
        }}
      />

      {/* Badge — top-left */}
      <img
        src={badgeSrc}
        alt=""
        className="absolute top-3 left-3 w-14 h-14 object-contain z-10 drop-shadow-lg"
      />

      {/* Titles count — top-right */}
      <div className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-glass/80 border border-glass-border text-sm font-bold ${config.labelColor}`}>
        {player.titles}x
      </div>

      {/* Player photo */}
      <div className="absolute inset-0 flex items-end justify-center pb-[100px]">
        {!photoError ? (
          <img
            src={photoSrc}
            alt={player.playerName}
            loading="lazy"
            className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300" />
        )}
      </div>

      {/* Glass info panel */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] p-3 pt-4 text-center space-y-1.5 overflow-hidden">
        {/* Glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${config.glow} 0%, transparent 60%)`,
          }}
        />
        {/* Name pill */}
        <div className={`relative inline-flex items-center justify-center px-5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border ${config.pillBorder} shadow-[0_0_20px_rgba(255,255,255,0.06)]`}>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">{player.playerName}</h3>
        </div>
        {/* Tier label */}
        <p className={`relative text-xs font-semibold tracking-widest ${config.labelColor}`}>
          {config.label}
        </p>
        {/* Seasons */}
        <p className="relative text-text-tertiary text-xs">
          {player.seasons.join(', ')}
        </p>
      </div>
    </Link>
  )
}

/* ─── HOF Mobile Card ─── */

function HofMobileCard({ player, tier }: { player: HofPlayerGroup; tier: TierKey }) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${player.playerId}.png`
  const badgeSrc = getBadgeSrc(player.titles)
  const config = TIER_CONFIGS[tier]

  return (
    <Link
      to={`/jugadores/${player.playerId}`}
      className={`group relative block rounded-xl overflow-hidden border border-glass-border ${config.borderHover} transition-all duration-300 h-[110px]`}
    >
      {/* Tier gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, ${config.radial} 0%, transparent 60%)`,
        }}
      />

      {/* Left info column */}
      <div className="absolute left-3 top-2.5 bottom-2.5 right-28 z-10 flex flex-col justify-between">
        {/* Name pill + tier + seasons — top */}
        <div>
          <div className={`inline-flex self-start items-center px-3 py-0.5 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border ${config.pillBorder}`}>
            <span className="font-bold text-text-primary text-sm truncate">{player.playerName}</span>
          </div>
          <div className={`text-[11px] font-semibold tracking-widest mt-1 ml-1 ${config.labelColor}`}>
            {config.label}
          </div>
        </div>
        {/* Seasons — bottom */}
        <div className="text-text-tertiary text-[11px] truncate">
          {player.seasons.join(', ')}
        </div>
      </div>

      {/* Badge — center */}
      <img
        src={badgeSrc}
        alt=""
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 object-contain z-10 drop-shadow-lg opacity-60"
      />

      {/* Player photo — right side */}
      <div className="absolute right-0 top-0 bottom-0 w-28 overflow-hidden">
        {!photoError ? (
          <img
            src={photoSrc}
            alt=""
            loading="lazy"
            className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />
        )}
      </div>
    </Link>
  )
}

/* ─── Summer Champion Cards (unified — always show Nx) ─── */

function SummerDesktopCard({ player }: { player: HofPlayerGroup }) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${player.playerId}.png`

  return (
    <Link
      to={`/jugadores/${player.playerId}`}
      className="group relative block rounded-xl overflow-hidden border border-glass-border hover:border-accent/40 transition-all duration-300 h-[380px] w-[280px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-surface-2/80 to-surface-1" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.12) 0%, transparent 70%)' }}
      />

      {/* Mushroom background — per card, behind player, rotated & clipped */}
      <img
        src="/champions.png"
        alt=""
        className="absolute -bottom-8 -right-8 w-56 h-56 object-contain opacity-[0.10] rotate-12 pointer-events-none select-none"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />

      {/* Titles count — top-right */}
      <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-glass/80 border border-glass-border text-sm font-bold text-accent-light">
        {player.titles}x
      </div>

      {/* Photo */}
      <div className="absolute inset-0 flex items-end justify-center pb-[100px]">
        {!photoError ? (
          <img
            src={photoSrc}
            alt={player.playerName}
            loading="lazy"
            className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300" />
        )}
      </div>

      {/* Info panel */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] p-3 pt-4 text-center space-y-1.5 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 60%)' }}
        />
        <div className="relative inline-flex items-center justify-center px-5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border border-white/[0.1] shadow-[0_0_20px_rgba(255,255,255,0.06)]">
          <h3 className="text-lg font-bold text-text-primary tracking-tight">{player.playerName}</h3>
        </div>
        <p className="relative text-text-tertiary text-xs">
          {player.seasons.join(', ')}
        </p>
      </div>
    </Link>
  )
}

function SummerMobileCard({ player }: { player: HofPlayerGroup }) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${player.playerId}.png`

  return (
    <Link
      to={`/jugadores/${player.playerId}`}
      className="group relative block rounded-xl overflow-hidden border border-glass-border hover:border-accent/40 transition-all duration-300 h-[110px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-surface-2/80 to-surface-1" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(239,68,68,0.12) 0%, transparent 60%)' }}
      />

      {/* Mushroom background — per card, behind player, rotated & clipped */}
      <img
        src="/champions.png"
        alt=""
        className="absolute -bottom-4 -right-4 w-28 h-28 object-contain opacity-[0.10] rotate-12 pointer-events-none select-none"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />

      {/* Left info */}
      <div className="absolute left-3 top-2.5 bottom-2.5 right-28 z-10 flex flex-col justify-between">
        <div>
          <div className="inline-flex self-start items-center px-3 py-0.5 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border border-white/[0.1]">
            <span className="font-bold text-text-primary text-sm truncate">{player.playerName}</span>
          </div>
          <div className="text-[11px] font-semibold tracking-widest mt-1 ml-1 text-accent-light">
            {player.titles}x SUMMER
          </div>
        </div>
        <div className="text-text-tertiary text-[11px] truncate">
          {player.seasons.join(', ')}
        </div>
      </div>

      {/* Photo */}
      <div className="absolute right-0 top-0 bottom-0 w-28 overflow-hidden">
        {!photoError ? (
          <img
            src={photoSrc}
            alt=""
            loading="lazy"
            className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />
        )}
      </div>
    </Link>
  )
}

/* ─── Champion Desktop Card (Summer / Fraca) ─── */

const CHAMPION_COLORS: Record<ChampionColorKey, { gradient: string; radial: string; glow: string; labelColor: string; borderHover: string; pillBorder: string }> = {
  purple: {
    gradient: 'from-purple-500/15 via-surface-2/80 to-surface-1',
    radial: 'rgba(168,85,247,0.12)',
    glow: 'rgba(168,85,247,0.12)',
    labelColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/40',
    pillBorder: 'border-purple-500/20',
  },
}

function ChampionDesktopCard({
  entry,
  accentColor,
}: {
  entry: { year: number; playerName: string; playerId: string; seasonName: string | null }
  accentColor: ChampionColorKey
}) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${entry.playerId}.png`
  const colors = CHAMPION_COLORS[accentColor]

  return (
    <Link
      to={`/jugadores/${entry.playerId}`}
      className={`group relative block rounded-xl overflow-hidden border border-glass-border ${colors.borderHover} transition-all duration-300 h-[380px] w-[280px]`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${colors.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${colors.radial} 0%, transparent 70%)`,
        }}
      />

      {/* 1x badge — top-right */}
      <div className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-glass/80 border border-glass-border text-sm font-bold ${colors.labelColor}`}>
        1x
      </div>

      {/* Player photo */}
      <div className="absolute inset-0 flex items-end justify-center pb-[90px]">
        {!photoError ? (
          <img
            src={photoSrc}
            alt={entry.playerName}
            loading="lazy"
            className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="h-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300" />
        )}
      </div>

      {/* Glass info panel */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] p-3 pt-4 text-center space-y-1 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 60%)`,
          }}
        />
        {/* Name pill */}
        <div className={`relative inline-flex items-center justify-center px-5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border ${colors.pillBorder} shadow-[0_0_20px_rgba(255,255,255,0.06)]`}>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">{entry.playerName}</h3>
        </div>
        <p className="relative text-text-tertiary text-xs">
          {entry.seasonName ?? entry.year}
        </p>
      </div>
    </Link>
  )
}

/* ─── Champion Mobile Card (Summer / Fraca) ─── */

function ChampionMobileCard({
  entry,
  accentColor,
}: {
  entry: { year: number; playerName: string; playerId: string; seasonName: string | null }
  accentColor: ChampionColorKey
}) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${entry.playerId}.png`
  const colors = CHAMPION_COLORS[accentColor]

  return (
    <Link
      to={`/jugadores/${entry.playerId}`}
      className={`group relative block rounded-xl overflow-hidden border border-glass-border ${colors.borderHover} transition-all duration-300 h-[110px]`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${colors.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, ${colors.radial} 0%, transparent 60%)`,
        }}
      />

      {/* Left info */}
      <div className="absolute left-3 top-2.5 bottom-2.5 right-28 z-10 flex flex-col justify-between">
        <div>
          <div className={`inline-flex self-start items-center px-3 py-0.5 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border ${colors.pillBorder}`}>
            <span className="font-bold text-text-primary text-sm truncate">{entry.playerName}</span>
          </div>
          <div className="text-text-tertiary text-[11px] mt-1 ml-1">
            {entry.seasonName ?? entry.year}
          </div>
        </div>
        <div className={`text-xs font-bold ${colors.labelColor}`}>
          1x
        </div>
      </div>

      {/* Player photo — right side */}
      <div className="absolute right-0 top-0 bottom-0 w-28 overflow-hidden">
        {!photoError ? (
          <img
            src={photoSrc}
            alt=""
            loading="lazy"
            className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <img src={getMonoFallback(photoSrc)} alt="" className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />
        )}
      </div>
    </Link>
  )
}
