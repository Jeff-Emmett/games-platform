import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter } from 'lucide-react'
import { gamesApi, platformsApi } from '../lib/api'
import GameCard from '../components/GameCard'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['games', selectedPlatform, searchTerm],
    queryFn: () =>
      gamesApi.getGames({
        platform: selectedPlatform || undefined,
        search: searchTerm || undefined,
      }),
  })

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformsApi.getPlatforms,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Game Library</h1>
        <p className="text-gray-400">
          Browse and play classic games from multiple platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Platform Filter */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="input pl-10 appearance-none cursor-pointer"
          >
            <option value="">All Platforms</option>
            {platforms?.map((platform) => (
              <option key={platform.id} value={platform.code}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Grid */}
      {gamesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      ) : games && games.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {games.length} game{games.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400 mb-4">No games found</p>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}
