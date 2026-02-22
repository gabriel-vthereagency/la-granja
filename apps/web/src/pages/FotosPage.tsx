import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { PageHeader, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

/* ─── Photo Data ─── */

const PHOTO_IDS = Array.from({ length: 40 }, (_, i) => i + 1)

const SWIPE_THRESHOLD = 50
const DRAG_CONSTRAINT = 300

/* ─── Main Component ─── */

export function FotosPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % PHOTO_IDS.length : null))
  }, [])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + PHOTO_IDS.length) % PHOTO_IDS.length : null))
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, goNext, goPrev])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  return (
    <PageContainer>
      <motion.div className="space-y-8" variants={fadeIn} initial="initial" animate="animate">
        {/* Header with back link */}
        <div className="flex items-center gap-4">
          <Link
            to="/historia"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-glass border border-glass-border hover:border-accent/40 text-text-secondary hover:text-accent-light transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <PageHeader title="Galería de Fotos" />
        </div>

        {/* Photo count */}
        <p className="text-text-tertiary text-sm -mt-4">
          {PHOTO_IDS.length} fotos de La Granja
        </p>

        {/* Photo Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {PHOTO_IDS.map((id, index) => (
            <motion.button
              key={id}
              variants={staggerItem}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-glass-border hover:border-accent/50 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {/* Image */}
              <img
                src={`/Historia/${id}.jpg`}
                alt={`La Granja #${id}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              {/* Hover icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Number tag */}
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                #{id}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            index={lightboxIndex}
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

/* ─── Lightbox Component ─── */

function Lightbox({
  index,
  onClose,
  onNext,
  onPrev,
}: {
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const [direction, setDirection] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(index)
  const constraintsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onNext()
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      onPrev()
    }
  }

  const photoId = PHOTO_IDS[currentIndex] ?? 1

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -400 : 400, opacity: 0, scale: 0.9 }),
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Counter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-white/70">
            <span className="text-white font-semibold">{currentIndex + 1}</span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-white/40">{PHOTO_IDS.length}</span>
          </span>
        </div>
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Navigation arrows (desktop only) */}
      <button
        type="button"
        onClick={onPrev}
        className="hidden sm:flex absolute left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 items-center justify-center text-white/70 hover:text-white transition-all duration-200"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="hidden sm:flex absolute right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 items-center justify-center text-white/70 hover:text-white transition-all duration-200"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Image area with drag/swipe */}
      <div ref={constraintsRef} className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-20 py-20">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: -DRAG_CONSTRAINT, right: DRAG_CONSTRAINT }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="absolute max-w-full max-h-full cursor-grab active:cursor-grabbing"
          >
            <img
              src={`/Historia/${photoId}.jpg`}
              alt={`La Granja #${photoId}`}
              className="max-h-[80vh] max-w-[90vw] sm:max-w-[80vw] object-contain rounded-lg select-none pointer-events-none"
              style={{ filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.6))' }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom hint (mobile) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center sm:hidden">
        <span className="text-xs text-white/30 font-mono">desliza para navegar</span>
      </div>
    </motion.div>
  )
}
