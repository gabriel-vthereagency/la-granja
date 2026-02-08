import { NavBar } from './NavBar'
import { AnimatedOutlet } from './AnimatedOutlet'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1 text-text-primary">
      <NavBar />
      <main className="flex-1">
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
