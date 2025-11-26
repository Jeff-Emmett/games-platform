import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Platform {
  id: number
  name: string
  code: string
  emulator_core: string
  file_extensions: string[]
  icon: string
  created_at: string
}

export interface Game {
  id: number
  title: string
  platform_id: number
  description?: string
  release_year?: number
  publisher?: string
  developer?: string
  genre?: string
  rom_path: string
  file_size?: number
  file_hash?: string
  cover_image?: string
  screenshot_1?: string
  screenshot_2?: string
  screenshot_3?: string
  rating?: number
  play_count: number
  favorite: boolean
  created_at: string
  last_played?: string
  platform: Platform
}

export interface GameRequest {
  id: number
  game_title: string
  platform_id: number
  user_email?: string
  user_notes?: string
  status: string
  admin_notes?: string
  installation_progress: number
  error_message?: string
  created_at: string
  updated_at: string
  platform: Platform
}

export const gamesApi = {
  getGames: async (params?: { platform?: string; search?: string }) => {
    const { data } = await api.get<Game[]>('/api/games', { params })
    return data
  },

  getGame: async (id: number) => {
    const { data } = await api.get<Game>(`/api/games/${id}`)
    return data
  },

  deleteGame: async (id: number) => {
    await api.delete(`/api/games/${id}`)
  },

  uploadGame: async (file: File, platform: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('platform', platform)
    const { data } = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

export const requestsApi = {
  getRequests: async (status?: string) => {
    const { data } = await api.get<GameRequest[]>('/api/requests', {
      params: { status },
    })
    return data
  },

  createRequest: async (request: {
    game_title: string
    platform_id: number
    user_email?: string
    user_notes?: string
  }) => {
    const { data } = await api.post<GameRequest>('/api/requests', request)
    return data
  },

  approveRequest: async (id: number) => {
    await api.put(`/api/requests/${id}/approve`)
  },

  rejectRequest: async (id: number) => {
    await api.put(`/api/requests/${id}/reject`)
  },
}

export const platformsApi = {
  getPlatforms: async () => {
    const { data } = await api.get<Platform[]>('/api/platforms')
    return data
  },
}

export const statsApi = {
  getStats: async () => {
    const { data } = await api.get('/api/stats')
    return data
  },
}
