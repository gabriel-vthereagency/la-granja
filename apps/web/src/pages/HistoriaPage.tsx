import { useState } from 'react'
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

/* ─── Photo Marquee Config ─── */

const PHOTO_COUNT = 44

const ALL_PHOTOS = Array.from({ length: PHOTO_COUNT }, (_, i) => i + 1)

const MARQUEE_ROWS = [
  { photos: ALL_PHOTOS.slice(0, 11), direction: 'left' as const, duration: '45s', tilt: '-2deg', opacity: 0.45 },
  { photos: ALL_PHOTOS.slice(11, 22), direction: 'right' as const, duration: '55s', tilt: '1.5deg', opacity: 0.4 },
  { photos: ALL_PHOTOS.slice(22, 33), direction: 'left' as const, duration: '35s', tilt: '-1deg', opacity: 0.5 },
  { photos: ALL_PHOTOS.slice(33, 44), direction: 'right' as const, duration: '50s', tilt: '2deg', opacity: 0.35 },
]

/* ─── Main Component ─── */

export function HistoriaPage() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ── Layer 0: Photo Marquee Background ── */}
      <PhotoMarqueeBackground />

      {/* ── Layer 1: Dark Overlay ── */}
      <div
        className="absolute inset-0 z-[1] backdrop-blur-[2px]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.85) 50%, rgba(9,9,11,0.80) 100%)',
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
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Photo Marquee Background ─── */

function PhotoMarqueeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 flex flex-col justify-center -mx-20">
        {MARQUEE_ROWS.map((row, i) => (
          <MarqueeRow key={i} {...row} />
        ))}
      </div>
    </div>
  )
}

/* ─── Marquee Row ─── */

function MarqueeRow({
  photos,
  direction,
  duration,
  tilt,
  opacity,
}: {
  photos: number[]
  direction: 'left' | 'right'
  duration: string
  tilt: string
  opacity: number
}) {
  const doubled = [...photos, ...photos]

  return (
    <div className="py-1.5" style={{ transform: `rotate(${tilt})`, opacity }}>
      <div
        className={`marquee-row ${direction === 'left' ? 'marquee-left' : 'marquee-right'}`}
        style={
          {
            '--marquee-duration': duration,
            width: `${doubled.length * 172}px`,
          } as React.CSSProperties
        }
      >
        {doubled.map((num, idx) => (
          <img
            key={`${num}-${idx}`}
            src={`/Historia/${num}.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-40 h-28 object-cover rounded-xl shrink-0 select-none pointer-events-none"
          />
        ))}
      </div>
    </div>
  )
}
