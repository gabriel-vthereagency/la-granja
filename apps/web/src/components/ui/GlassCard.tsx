import { motion } from 'framer-motion'
import { cardHover } from '../../lib/motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  as?: 'div' | 'section' | 'article'
}

export function GlassCard({
  children,
  className = '',
  hoverable = false,
  as = 'div',
}: GlassCardProps) {
  const baseClasses =
    'bg-glass border border-glass-border rounded-xl backdrop-blur-sm'

  if (hoverable) {
    const MotionComponent = motion.create(as)
    return (
      <MotionComponent
        className={`${baseClasses} cursor-pointer ${className}`}
        variants={cardHover}
        initial="rest"
        whileHover="hover"
      >
        {children}
      </MotionComponent>
    )
  }

  const Tag = as
  return <Tag className={`${baseClasses} ${className}`}>{children}</Tag>
}
