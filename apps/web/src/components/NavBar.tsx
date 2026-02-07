import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { smooth } from '../lib/motion'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/historial', label: 'Historial' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/estadisticas', label: 'Stats' },
  { to: '/reglamento', label: 'Reglamento' },
  { to: '/historia', label: 'Historia' },
]

function isActive(linkTo: string, pathname: string) {
  if (linkTo === '/') return pathname === '/'
  return pathname === linkTo || pathname.startsWith(linkTo + '/')
}

export function NavBar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <nav className="sticky top-0 z-50 border-b border-glass-border bg-surface-1/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/logo%20horizontal.png"
              alt="La Granja Poker"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = isActive(link.to, location.pathname)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-1.5 text-sm rounded-md transition-colors ${
                    active
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-md bg-accent-muted"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text-secondary hover:text-text-primary p-2 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={smooth}
            className="md:hidden overflow-hidden border-t border-glass-border"
          >
            <div className="mx-auto max-w-6xl px-4 py-3 space-y-1">
              {links.map((link) => {
                const active = isActive(link.to, location.pathname)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      active
                        ? 'text-text-primary bg-accent-muted'
                        : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
