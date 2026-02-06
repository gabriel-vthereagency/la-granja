import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/historial', label: 'Historial' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/estadisticas', label: 'Stats' },
  { to: '/reglamento', label: 'Reglamento' },
  { to: '/historia', label: 'Historia' },
]

export function NavBar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <img
              src="/logo%20horizontal.png"
              alt="La Granja Poker"
              className="h-8 w-auto"
            />
          </Link>
          {/* Desktop menu */}
          <div className="hidden md:flex gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors ${
                  location.pathname === link.to
                    ? 'text-red-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-700">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm transition-colors ${
                  location.pathname === link.to
                    ? 'text-red-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
