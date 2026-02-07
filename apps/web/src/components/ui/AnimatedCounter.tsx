import { useEffect, useRef, useState, useCallback } from 'react'
import { useInView } from 'framer-motion'
import { counterConfig } from '../../lib/motion'

interface AnimatedCounterProps {
  value: number
  format?: (value: number) => string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  format = (v) => String(Math.round(v)),
  className = '',
  duration = counterConfig.duration,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.01 })
  const [display, setDisplay] = useState('0')
  const formatRef = useRef(format)
  formatRef.current = format
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = counterConfig.ease(progress)
      const current = eased * value

      setDisplay(formatRef.current(current))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  // Trigger on inView
  useEffect(() => {
    if (isInView) animate()
  }, [isInView, animate])

  // Fallback: if after 2s the counter hasn't animated, force it
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimated.current) animate()
    }, 2000)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
