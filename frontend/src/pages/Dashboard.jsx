import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  CalendarIcon, 
  MapPinIcon, 
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournaments/')
        setTournaments(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch tournaments')
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karate-blue"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tournaments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your karate tournaments and track their progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/tournament/create"
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Tournament
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="mt-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new tournament.
          </p>
          <div className="mt-6">
            <Link
              to="/tournament/create"
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Tournament
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              to={`/tournament/${tournament.id}`}
              className="group relative bg-white rounded-lg shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-gray-300 transition-all duration-150 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {tournament.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${getTournamentStatusStyle(tournament.status)}`}
                  >
                    {tournament.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {new Date(tournament.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {tournament.venue}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="group flex items-center text-sm text-gray-500">
                    <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>12 Participants</span>
                  </div>
                  <div className="group flex items-center text-sm text-gray-500">
                    <ChartBarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>8 Events</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-karate-blue to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const getTournamentStatusStyle = (status) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'PUBLISHED':
      return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default Dashboard