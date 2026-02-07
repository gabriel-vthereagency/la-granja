import { NavBar } from './NavBar'
import { AnimatedOutlet } from './AnimatedOutlet'

export function Layout() {
  return (
    <div className="min-h-screen bg-surface-1 text-text-primary">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AnimatedOutlet />
      </main>
      <footer className="border-t border-glass-border py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-4 text-center text-text-tertiary text-sm">
          La Granja Poker — "No tratés de entenderla, disfrutála"
        </div>
      </footer>
    </div>
  )
}
