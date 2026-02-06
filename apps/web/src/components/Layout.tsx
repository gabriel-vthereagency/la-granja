import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          La Granja Poker - "No tratés de entenderla, disfrutála"
        </div>
      </footer>
    </div>
  )
}
