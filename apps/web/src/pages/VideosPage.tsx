import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHeader, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

/* ─── Video Data ─── */

const VIDEOS = [
  { id: 'ijpsrh', title: 'La Granja Highlights #1' },
  { id: 'qv53l9', title: 'La Granja Highlights #2' },
  { id: '9nzlo3', title: 'La Granja Highlights #3' },
  { id: 'nnitgw', title: 'La Granja Highlights #4' },
]

/* ─── Main Component ─── */

export function VideosPage() {
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
          <PageHeader title="Videos" />
        </div>

        <p className="text-text-tertiary text-sm -mt-4">
          {VIDEOS.length} videos de La Granja
        </p>

        {/* Video Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {VIDEOS.map((video) => (
            <motion.div
              key={video.id}
              variants={staggerItem}
              className="group relative rounded-xl overflow-hidden border border-glass-border hover:border-accent/40 transition-all duration-300 bg-surface-2"
            >
              {/* Video embed */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://streamable.com/e/${video.id}?loop=0`}
                  allow="fullscreen"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-none"
                  title={video.title}
                  loading="lazy"
                />
              </div>

              {/* Title bar */}
              <div className="px-4 py-3 flex items-center gap-3 bg-glass/50 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4.5 2.5l7 4.5-7 4.5V2.5z" fill="var(--color-accent)" />
                  </svg>
                </div>
                <span className="text-sm text-text-secondary font-medium truncate">
                  {video.title}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
