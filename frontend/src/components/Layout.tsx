import { Outlet, Link, useLocation } from 'react-router-dom'
import { Gamepad2, Home, ListPlus } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold">Retro Games</h1>
                <p className="text-sm text-gray-400">Play classic games in your browser</p>
              </div>
            </Link>

            <nav className="flex gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Library</span>
              </Link>
              <Link
                to="/requests"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/requests')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <ListPlus className="w-5 h-5" />
                <span>Requests</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Powered by EmulatorJS • Built with React & FastAPI</p>
        </div>
      </footer>
    </div>
  )
}
