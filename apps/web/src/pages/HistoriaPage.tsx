import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, PageHeader } from '../components/ui'
import { fadeIn } from '../lib/motion'

/* ─── Text Content ─── */

const TEXT_PART_1 = [
  'La Granja no nació como un proyecto.\nNació como una excusa.',
  'Una mesa, unas fichas, un par de cervezas y la firme convicción de que esta vez sí íbamos a jugar bien al póker.\nEso fue hace más de diez años.\nSpoiler: algunos todavía no aprendieron.',
  'Por La Granja ya pasaron más de 160 jugadores.\nAlgunos llegaron con teoría, otros con intuición, varios con humo.\nUnos pocos se fueron campeones.\nOtros se fueron diciendo "nunca más"… y volvieron.',
  'Somos una mezcla perfecta de caos y buen póker.\nEl buen póker aparece de vez en cuando, como para justificar todo lo demás.',
  'Acá conviven generaciones, estilos y supersticiones.\nEstá el grupo de la metafísica, los kabuleros, los que no se sientan si no es el mismo asiento,\ny los que creen —con una fe inquebrantable— que los reyes nunca ganan.\nSorprendentemente, tienen seguidores.',
]

const TEXT_PART_2 = [
  'En La Granja también hay herencias que no se discuten.\nUn jugador que ya no está dejó instalada una verdad eterna:\ncon Q6 es all-in.\nNo importa el stack, la mesa ni el contexto.\nNo es estrategia. Es historia.',
  'Somos una granja inclusiva y diversa.\nAcá entra el que juega sólido, el que improvisa, el que calcula odds\ny el que "sintió algo" y fue para adelante.',
  'No somos profesionales.\nNo somos amateurs.\nSomos monos sin evolucionar,\nempujando fichas con una convicción que no siempre tiene sentido,\npero casi siempre tiene consecuencias.',
  'La Granja no es solo póker.\nEs una historia que se escribe fecha tras fecha,\ncon reglas que cambian, máximas sin fundamento que persisten\ny la certeza de que, pase lo que pase,\nla mesa vuelve a armarse.',
  'Porque al final,\nno se trata de jugar perfecto.\nSe trata de volver a sentarse.',
  'Bienvenido a La Granja.\nDonde el póker es la excusa.',
]

/* ─── Photo Cloud Config ─── */

const PHOTO_COUNT = 40
const PHOTO_IDS = Array.from({ length: PHOTO_COUNT }, (_, i) => i + 1)

const GRID_COLS = 12
const GRID_ROWS = 10
const TILE_W = 200
const TILE_H = 140
const GAP_X = 22
const GAP_Y = 18
const ROW_OFFSET = 36
const FIELD_PADDING = 160

const FIELD_WIDTH = GRID_COLS * (TILE_W + GAP_X) + (GRID_ROWS - 1) * ROW_OFFSET + FIELD_PADDING * 2
const FIELD_HEIGHT = GRID_ROWS * (TILE_H + GAP_Y) + FIELD_PADDING * 2

const PHOTO_TILES = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, index) => {
  const row = Math.floor(index / GRID_COLS)
  const col = index % GRID_COLS
  const jitterX = ((index * 37) % 16) - 8
  const jitterY = ((index * 53) % 14) - 7
  const rotate = ((index * 29) % 9) - 4
  const scale = 0.92 + (((index * 17) % 12) / 100)
  const x = col * (TILE_W + GAP_X) + row * ROW_OFFSET + jitterX + FIELD_PADDING
  const y = row * (TILE_H + GAP_Y) + jitterY + FIELD_PADDING
  const id = PHOTO_IDS[index % PHOTO_IDS.length] ?? 1

  return { id, x, y, rotate, scale }
})

/* ─── Main Component ─── */

export function HistoriaPage() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ── Layer 0: Photo Cloud Background ── */}
      <PhotoCloudBackground />

      {/* ── Layer 1: Dark Overlay ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.78) 40%, rgba(9,9,11,0.45) 70%, rgba(9,9,11,0.12) 100%)',
        }}
      />

      {/* ── Layer 2: Text Content ── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6">
        <motion.div className="space-y-8" variants={fadeIn} initial="initial" animate="animate">
          <PageHeader title="Nuestra Historia" />

          <GlassCard as="section" className="p-6 sm:p-8 md:p-10">
            {/* Part 1 — Always visible */}
            <div className="space-y-4 text-text-secondary leading-relaxed">
              {TEXT_PART_1.map((paragraph, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'text-lg sm:text-xl font-medium text-text-primary italic' : 'whitespace-pre-line'}
                >
                  {i === 0 ? paragraph.split('\n').map((line, j) => (
                    <span key={j}>{line}{j === 0 && <br />}</span>
                  )) : paragraph}
                </p>
              ))}
            </div>

            {/* Accordion: Part 2 */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 text-text-secondary leading-relaxed pt-4">
                    {TEXT_PART_2.map((paragraph, i) => (
                      <p
                        key={i}
                        className={
                          i === TEXT_PART_2.length - 1
                            ? 'text-lg font-semibold text-accent-light italic whitespace-pre-line'
                            : 'whitespace-pre-line'
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gradient fade hint when collapsed */}
            {!expanded && (
              <div
                className="h-12 -mt-12 relative z-[1]"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04))',
                }}
              />
            )}

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:text-accent transition-colors mt-4"
            >
              {expanded ? 'Leer menos' : 'Seguir leyendo'}
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>
          </GlassCard>

          {/* Gallery Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              to="/historia/fotos"
              className="group relative rounded-xl overflow-hidden border border-glass-border hover:border-accent/40 transition-all duration-300 h-32 sm:h-40"
            >
              {/* Background photo collage */}
              <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                {[1, 5, 12, 8, 20, 30].map((id) => (
                  <img key={id} src={`/Historia/${id}.jpg`} alt="" className="w-full h-full object-cover" loading="lazy" />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/80 to-surface-1/40" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--color-accent)" strokeWidth="1.5" />
                    <circle cx="8.5" cy="9" r="2" stroke="var(--color-accent)" strokeWidth="1.5" />
                    <path d="M3 15l4-4 3 3 4-5 5 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">Fotos</p>
                  <p className="text-[11px] text-text-tertiary">40 fotos</p>
                </div>
              </div>
            </Link>

            <Link
              to="/historia/videos"
              className="group relative rounded-xl overflow-hidden border border-glass-border hover:border-accent/40 transition-all duration-300 h-32 sm:h-40"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-surface-2 to-surface-1" />
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(239,68,68,0.3) 0%, transparent 60%)' }}
              />
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="4" width="18" height="14" rx="3" stroke="var(--color-accent)" strokeWidth="1.5" />
                    <path d="M9 9l5 3-5 3V9z" fill="var(--color-accent)" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">Videos</p>
                  <p className="text-[11px] text-text-tertiary">4 videos</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Photo Cloud Background ─── */

function PhotoCloudBackground() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef<{
    active: boolean
    startX: number
    startY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
  }, [])

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    }
    setDragging(true)
    el.setPointerCapture(event.pointerId)
  }

  const onDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    const state = dragState.current
    if (!el || !state?.active) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    el.scrollLeft = state.scrollLeft - dx
    el.scrollTop = state.scrollTop - dy
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || !dragState.current?.active) return
    dragState.current.active = false
    setDragging(false)
    el.releasePointerCapture(event.pointerId)
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        ref={scrollRef}
        className={`photo-cloud h-full w-full overflow-auto ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="relative" style={{ width: `${FIELD_WIDTH}px`, height: `${FIELD_HEIGHT}px` }}>
          {PHOTO_TILES.map((tile, idx) => (
            <div
              key={`${tile.id}-${idx}`}
              className="absolute"
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                transform: `rotate(${tile.rotate}deg) scale(${tile.scale})`,
              }}
            >
              <img
                src={`/Historia/${tile.id}.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                className="block select-none pointer-events-none rounded-xl shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                style={{
                  width: `${TILE_W}px`,
                  height: `${TILE_H}px`,
                  objectFit: 'cover',
                  filter: 'saturate(1.05) contrast(1.02)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
