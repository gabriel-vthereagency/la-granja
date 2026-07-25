import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CutoutPhoto } from './CutoutPhoto'
import { formatPoints } from '../../utils/formatPoints'
import { heroFadeUp, heroScale } from '../../lib/motion'

interface Props {
  player: { id: string; name: string }
  points: number
  events: number
  golds: number
  /** Rendered as an outlined backdrop numeral, e.g. 2026 */
  year: number
}

/**
 * Season champion hero.
 *
 * The weekly podium is contained — circles, rings, numbered badges. This is the
 * opposite on purpose: an unframed, near life-size cutout with the type beside
 * it. Extends the Hall of Fame cutout language rather than inventing a new one.
 */
export function ChampionHero({ player, points, events, golds, year }: Props) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial="initial"
      animate="animate"
      transition={{ delayChildren: 0.3 }}
    >
      {/* Outlined year — grid-breaking backdrop, desktop only */}
      <span
        aria-hidden="true"
        className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 z-0 leading-none font-bold tracking-tighter pointer-events-none select-none"
        style={{
          fontFamily: 'var(--font-nav)',
          fontSize: 'clamp(140px, 16vw, 220px)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.06)',
        }}
      >
        {year}
      </span>

      {/* Red halo that lifts the cutout off the surface */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[420px] h-[420px] md:w-[560px] md:h-[560px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 45%, transparent 70%)',
        }}
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* The champion, unframed */}
      <motion.div variants={heroScale} className="relative z-10">
        <Link to={`/jugadores/${player.id}`} className="block group">
          <CutoutPhoto
            playerId={player.id}
            alt={player.name}
            size="hero"
            priority
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      </motion.div>

      {/* Glass data panel, riding the bottom edge of the cutout */}
      <motion.div
        variants={heroFadeUp}
        className="relative z-20 -mt-5 md:-mt-8 w-full max-w-[280px] md:max-w-[340px] rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] px-5 py-3.5 text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.14) 0%, transparent 65%)',
          }}
        />

        <p className="relative text-[10px] md:text-[11px] font-semibold tracking-[0.18em] text-accent-light">
          CAMPEÓN TEMPORADA REGULAR
        </p>

        <Link
          to={`/jugadores/${player.id}`}
          className="relative block text-2xl md:text-3xl font-bold tracking-tight text-text-primary hover:text-accent-light transition-colors"
          style={{ fontFamily: 'var(--font-nav)' }}
        >
          {player.name}
        </Link>

        <p className="relative mt-1 text-xs md:text-sm text-text-secondary">
          <span className="font-semibold text-success">{formatPoints(points)}</span> pts
          <span className="text-text-tertiary"> · </span>
          {events} fechas
          <span className="text-text-tertiary"> · </span>
          <span className="text-gold">{golds}</span> {golds === 1 ? 'oro' : 'oros'}
        </p>
      </motion.div>
    </motion.div>
  )
}
