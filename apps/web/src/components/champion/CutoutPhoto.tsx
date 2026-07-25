import { useState } from 'react'

const MONO_PHOTOS = ['/Players/mono1.png', '/Players/mono2.png', '/Players/mono-3.png']

/** Pick a deterministic mono photo based on a string key */
function getMonoFallback(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return MONO_PHOTOS[Math.abs(hash) % MONO_PHOTOS.length] ?? MONO_PHOTOS[0]!
}

/**
 * Cutout photos are transparent PNGs of the full player, not head crops.
 * They are deliberately unframed — no ring, no circle, no overflow clipping —
 * so they read differently from the weekly podium circles.
 */
const SIZES = {
  hero: 'h-[260px] sm:h-[300px] md:h-[420px] lg:h-[500px] drop-shadow-[0_8px_40px_rgba(0,0,0,0.7)]',
  md: 'h-[180px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]',
  sm: 'h-[84px] md:h-[104px] drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)]',
} as const

export type CutoutSize = keyof typeof SIZES

interface Props {
  playerId: string
  alt: string
  size: CutoutSize
  /** Loads eagerly — use for above-the-fold heroes only */
  priority?: boolean
  className?: string
}

export function CutoutPhoto({ playerId, alt, size, priority = false, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const src = failed ? getMonoFallback(playerId) : `/Players/${playerId}.png`

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`w-auto max-w-full object-contain object-bottom select-none ${SIZES[size]} ${className}`}
    />
  )
}
