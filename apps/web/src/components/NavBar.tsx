import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { smooth } from '../lib/motion'

const links = [
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
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6 md:pt-5"
      style={{ fontFamily: 'var(--font-nav)' }}
    >
      {/* Desktop: floating pill nav */}
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/logo%20horizontal.png"
                alt="La Granja Poker"
                className="h-9 w-auto"
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const active = isActive(link.to, location.pathname)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 text-sm font-medium tracking-wide rounded-lg transition-colors ${
                      active
                        ? 'text-text-primary'
                        : 'text-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-text-tertiary hover:text-text-primary p-2 transition-colors"
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

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={smooth}
                className="md:hidden overflow-hidden border-t border-white/[0.06]"
              >
                <div className="px-4 py-3 space-y-0.5">
                  {links.map((link) => {
                    const active = isActive(link.to, location.pathname)
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`block px-3.5 py-2.5 text-sm font-medium tracking-wide rounded-lg transition-colors ${
                          active
                            ? 'text-white bg-white/[0.08]'
                            : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
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
        </div>
      </div>
    </nav>
  )
}
