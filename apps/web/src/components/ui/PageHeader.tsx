import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeIn } from '../../lib/motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Volver',
}: PageHeaderProps) {
  return (
    <motion.div
      className="space-y-1"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-text-secondary">{subtitle}</p>
      )}
    </motion.div>
  )
}
