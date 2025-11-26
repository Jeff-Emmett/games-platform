import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { requestsApi, platformsApi } from '../lib/api'

export default function RequestsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    game_title: '',
    platform_id: '',
    user_email: '',
    user_notes: '',
  })

  const queryClient = useQueryClient()

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsApi.getRequests(),
  })

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformsApi.getPlatforms,
  })

  const createRequestMutation = useMutation({
    mutationFn: requestsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      setShowForm(false)
      setFormData({
        game_title: '',
        platform_id: '',
        user_email: '',
        user_notes: '',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRequestMutation.mutate({
      game_title: formData.game_title,
      platform_id: Number(formData.platform_id),
      user_email: formData.user_email || undefined,
      user_notes: formData.user_notes || undefined,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'approved':
      case 'installing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      case 'installed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'approved':
      case 'installing':
        return 'bg-blue-500/20 text-blue-500'
      case 'installed':
        return 'bg-green-500/20 text-green-500'
      case 'rejected':
      case 'failed':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Game Requests</h1>
          <p className="text-gray-400">Request new games to be added to the library</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Request a Game</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Title</label>
              <input
                type="text"
                value={formData.game_title}
                onChange={(e) =>
                  setFormData({ ...formData, game_title: e.target.value })
                }
                className="input"
                placeholder="e.g., Kingdom Hearts"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                value={formData.platform_id}
                onChange={(e) =>
                  setFormData({ ...formData, platform_id: e.target.value })
                }
                className="input"
                required
              >
                <option value="">Select a platform</option>
                {platforms?.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) =>
                  setFormData({ ...formData, user_email: e.target.value })
                }
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.user_notes}
                onChange={(e) =>
                  setFormData({ ...formData, user_notes: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Any specific version or notes..."
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{request.game_title}</h3>
                    <p className="text-gray-400 mb-2">{request.platform.name}</p>
                    {request.user_notes && (
                      <p className="text-sm text-gray-500 mb-2">{request.user_notes}</p>
                    )}
                    <p className="text-xs text-gray-600">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                  {request.status === 'installing' && (
                    <div className="text-sm text-gray-400">
                      {request.installation_progress}%
                    </div>
                  )}
                </div>
              </div>
              {request.error_message && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{request.error_message}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 card">
            <p className="text-xl text-gray-400 mb-4">No requests yet</p>
            <p className="text-gray-500">
              Submit a request to add new games to the library
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
