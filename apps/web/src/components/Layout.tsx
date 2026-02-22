import { NavBar } from './NavBar'
import { AnimatedOutlet } from './AnimatedOutlet'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1 text-text-primary">
      <NavBar />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <footer className="relative mt-auto overflow-hidden">
        {/* Red gradient top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        {/* Subtle red glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 70%)' }}
        />

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <img
              src="/logo%20horizontal.png"
              alt="La Granja Poker"
              className="h-8 object-contain opacity-60"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

            {/* Tagline */}
            <p className="text-text-tertiary text-sm italic">
              "No tratés de entenderla, disfrutála"
            </p>

            {/* Divider */}
            <div className="w-16 h-px bg-accent/20" />

            {/* Credits */}
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <span>Desarrollado por</span>
              <a
                href="https://www.linkedin.com/in/gabrielnoe/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light hover:text-accent transition font-medium"
              >
                Shark
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
