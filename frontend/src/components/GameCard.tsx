import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import type { Game } from '../lib/api'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const coverImage = game.cover_image || '/placeholder-game.png'

  return (
    <Link
      to={`/game/${game.id}`}
      className="card group hover:ring-2 hover:ring-primary-500 transition-all"
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] bg-gray-700 relative overflow-hidden">
        <img
          src={coverImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-game.png'
          }}
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary-600 rounded-full p-4">
            <Play className="w-8 h-8 fill-current" />
          </div>
        </div>

        {/* Favorite Badge */}
        {game.favorite && (
          <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{game.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{game.platform.name}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {game.release_year && <span>{game.release_year}</span>}
          {game.genre && <span>{game.genre}</span>}
        </div>

        {game.play_count > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Played {game.play_count} times
          </div>
        )}
      </div>
    </Link>
  )
}
