import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { PlayerStanding } from '../../hooks/useStandings'
import { CutoutPhoto } from '../champion/CutoutPhoto'
import { formatPoints } from '../../utils/formatPoints'
import { staggerContainer, staggerItem } from '../../lib/motion'

const DIRECT_SPOTS = 8

interface Props {
  standings: PlayerStanding[]
  /** Player id of the Fraca winner, who joins as the 9th seat */
  fracaWinnerId: string | null
}

/**
 * Who plays the Final Seven: the top 8 of the regular season plus the Fraca
 * winner. Red marks the direct qualifiers, gold the Fraca seat — the same
 * convention the standings table already uses for those zones.
 */
export function FinalSevenQualifiers({ standings, fracaWinnerId }: Props) {
  const direct = standings.slice(0, DIRECT_SPOTS)

  // Only show the Fraca row if that player did not already qualify directly
  const fracaWinner =
    fracaWinnerId && !direct.some((s) => s.playerId === fracaWinnerId)
      ? (standings.find((s) => s.playerId === fracaWinnerId) ?? null)
      : null

  if (direct.length === 0) return null

  const total = direct.length + (fracaWinner ? 1 : 0)

  return (
    <div className="relative rounded-xl overflow-hidden border border-accent/20 bg-gradient-to-b from-accent/[0.07] via-surface-2/60 to-surface-1">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 65%)',
        }}
      />

      {/* Poker table, clipped in the corner */}
      <img
        src="/final7.png"
        alt=""
        aria-hidden="true"
        className="absolute -right-10 -top-12 w-56 h-56 md:w-72 md:h-72 object-contain opacity-[0.08] rotate-12 pointer-events-none select-none"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />

      <div className="relative p-5 md:p-6">
        <div className="flex items-baseline justify-between gap-3 mb-5">
          <h2
            className="text-sm md:text-base font-semibold tracking-[0.14em] text-accent-light"
            style={{ fontFamily: 'var(--font-nav)' }}
          >
            CLASIFICADOS AL FINAL SEVEN
          </h2>
          <span className="shrink-0 text-xs text-text-tertiary">{total} jugadores</span>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-y-5 gap-x-2"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {direct.map((s) => (
            <motion.div key={s.playerId} variants={staggerItem}>
              <QualifierSlot
                playerId={s.playerId}
                name={s.player.name}
                points={s.totalPoints}
                position={s.position}
              />
            </motion.div>
          ))}
        </motion.div>

        {fracaWinner && (
          <div className="mt-6 pt-5 border-t border-gold/20">
            <Link
              to={`/jugadores/${fracaWinner.playerId}`}
              className="group flex items-center gap-4 rounded-xl bg-gold/[0.06] border border-gold/20 px-4 py-3 transition-colors hover:bg-gold/[0.1]"
            >
              <div className="shrink-0 w-14 flex justify-center">
                <CutoutPhoto
                  playerId={fracaWinner.playerId}
                  alt={fracaWinner.player.name}
                  size="sm"
                  className="!h-[64px] transition-transform duration-300 group-hover:scale-[1.05]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-text-primary group-hover:text-gold transition-colors">
                  {fracaWinner.player.name}
                </div>
                <div className="text-xs text-text-tertiary">
                  {formatPoints(fracaWinner.totalPoints)} pts en la temporada regular
                </div>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[11px] font-semibold tracking-wide">
                Ganó el Fraca
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function QualifierSlot({
  playerId,
  name,
  points,
  position,
}: {
  playerId: string
  name: string
  points: number
  position: number
}) {
  return (
    <Link to={`/jugadores/${playerId}`} className="group flex flex-col items-center text-center">
      <div className="relative flex items-end justify-center h-[84px] md:h-[104px]">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.28) 0%, transparent 70%)' }}
        />
        <CutoutPhoto
          playerId={playerId}
          alt={name}
          size="sm"
          className="relative transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-accent">{position}°</span>
        <span className="text-sm font-medium text-text-primary truncate max-w-[90px] group-hover:text-accent-light transition-colors">
          {name}
        </span>
      </div>
      <span className="text-[11px] text-text-tertiary">{formatPoints(points)} pts</span>
    </Link>
  )
}
