import type { Variants, Transition } from 'framer-motion'

// ── Transition Presets ──────────────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const smooth: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1], // ease-out-expo
}

export const quick: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
}

// ── Page Transitions ────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// ── Section / Element Entrance ──────────────────────────────────────

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smooth,
  },
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: smooth,
  },
}

// ── Stagger Containers ──────────────────────────────────────────────

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smooth,
  },
}

// ── Card Hover ──────────────────────────────────────────────────────

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.015,
    y: -2,
    transition: spring,
  },
}

// ── Table Row Entrance ──────────────────────────────────────────────

export const tableRow: Variants = {
  initial: {
    opacity: 0,
    x: -8,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: quick,
  },
}

// ── Hero Animations ─────────────────────────────────────────────────

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export const heroFadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export const heroScale: Variants = {
  initial: { opacity: 0, scale: 0.85, y: 30 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

export const floatSlow: Variants = {
  animate: {
    y: [0, -35, 0],
    rotate: [0, 12, -12, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const bounceDown: Variants = {
  animate: {
    y: [0, 6, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ── Counter Config ──────────────────────────────────────────────────

export const counterConfig = {
  duration: 1.2,
  ease: (t: number) => 1 - Math.pow(1 - t, 4), // ease-out-quart
}
