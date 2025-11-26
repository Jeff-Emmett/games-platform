import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, User, Gamepad } from 'lucide-react'
import { gamesApi } from '../lib/api'
import Emulator from '../components/Emulator'

export default function GamePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getGame(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">Game not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Library</span>
      </button>

      {/* Game Header */}
      <div className="flex gap-6 items-start">
        {/* Cover */}
        <div className="w-48 flex-shrink-0">
          <img
            src={game.cover_image || '/placeholder-game.png'}
            alt={game.title}
            className="w-full rounded-lg shadow-xl"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-game.png'
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-xl text-primary-400 mb-4">{game.platform.name}</p>

          {game.description && (
            <p className="text-gray-300 mb-6">{game.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {game.release_year && (
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{game.release_year}</span>
              </div>
            )}
            {game.publisher && (
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span>{game.publisher}</span>
              </div>
            )}
            {game.genre && (
              <div className="flex items-center gap-2 text-gray-400">
                <Gamepad className="w-4 h-4" />
                <span>{game.genre}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emulator */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">Play Now</h2>
        <Emulator game={game} />
        <div className="mt-4 text-sm text-gray-400">
          <p>Use keyboard or connect a gamepad to play</p>
          <p className="mt-1">Press ESC for emulator menu</p>
        </div>
      </div>

      {/* Screenshots */}
      {(game.screenshot_1 || game.screenshot_2 || game.screenshot_3) && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
          <div className="grid grid-cols-3 gap-4">
            {game.screenshot_1 && (
              <img
                src={game.screenshot_1}
                alt="Screenshot 1"
                className="w-full rounded-lg"
              />
            )}
            {game.screenshot_2 && (
              <img
                src={game.screenshot_2}
                alt="Screenshot 2"
                className="w-full rounded-lg"
              />
            )}
            {game.screenshot_3 && (
              <img
                src={game.screenshot_3}
                alt="Screenshot 3"
                className="w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
