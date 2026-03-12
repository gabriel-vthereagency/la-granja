import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { PageHeader, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'
import { supabase } from '../lib/supabase'

/* ─── Photo Data ─── */

const STATIC_COUNT = 43
const BUCKET = 'historia'

type Photo = { src: string; key: string }

function getStaticPhotos(): Photo[] {
  return Array.from({ length: STATIC_COUNT }, (_, i) => ({
    key: `static-${i + 1}`,
    src: `/Historia/${i + 1}.jpg`,
  }))
}

async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Compression failed'))
      }, 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

const SWIPE_THRESHOLD = 50
const DRAG_CONSTRAINT = 300

/* ─── Main Component ─── */

export function FotosPage() {
  const [photos, setPhotos] = useState<Photo[]>(getStaticPhotos())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load dynamic photos from Supabase Storage
  useEffect(() => {
    supabase.storage
      .from(BUCKET)
      .list('', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data, error }) => {
        if (error || !data) return
        const dynamic: Photo[] = data
          .filter((f) => f.name !== '.emptyFolderPlaceholder')
          .map((f) => ({
            key: `supabase-${f.name}`,
            src: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
          }))
        if (dynamic.length > 0) {
          setPhotos([...getStaticPhotos(), ...dynamic])
        }
      })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('La foto no puede superar 15MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const blob = await compressImage(file)
      const filename = `${crypto.randomUUID()}.jpg`
      const { error } = await supabase.storage.from(BUCKET).upload(filename, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      })
      if (error) throw error
      const src = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl
      setPhotos((prev) => [...prev, { key: `supabase-${filename}`, src }])
    } catch {
      setUploadError('No se pudo subir la foto. Intentá de nuevo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null))
  }, [photos.length])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null))
  }, [photos.length])

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

        {/* Count + Upload */}
        <div className="flex items-center justify-between -mt-4">
          <p className="text-text-tertiary text-sm">{photos.length} fotos de La Granja</p>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 text-accent-light text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v8M4 4l3-3 3 3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Subir foto
                </>
              )}
            </button>
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Photo Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {photos.map((photo, index) => (
            <motion.button
              key={photo.key}
              variants={staggerItem}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-glass-border hover:border-accent/50 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <img
                src={photo.src}
                alt="La Granja"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
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
  photos,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  photos: Photo[]
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

  const photo = photos[currentIndex]

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
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-white/70">
            <span className="text-white font-semibold">{currentIndex + 1}</span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-white/40">{photos.length}</span>
          </span>
        </div>
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
            {photo && (
              <img
                src={photo.src}
                alt="La Granja"
                className="max-h-[80vh] max-w-[90vw] sm:max-w-[80vw] object-contain rounded-lg select-none pointer-events-none"
                style={{ filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.6))' }}
                draggable={false}
              />
            )}
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
