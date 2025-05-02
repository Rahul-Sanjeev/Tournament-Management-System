import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  MapPinIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
  TrophyIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

// Use same animation variants as TournamentView
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' }
}

const listItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
}

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 150 }
  }
}

const Dashboard = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournaments/')
        // Ensure API returns participant_count and event_count
        setTournaments(response.data.map(t => ({
          ...t,
          participant_count: t.participants?.length || 0,
          event_count: t.events?.length || 0
        })))
        setError(null)
      } catch (err) {
        setError('Failed to fetch tournaments')
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  // Keep loading spinner from TournamentView
  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header Section - Match TournamentView styling */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 pt-8 pb-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
              <p className="text-gray-200 font-medium">
                Manage your martial arts competitions
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-6 md:mt-0"
            >
              <Link
                to="/tournament/create"
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Tournament
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Match TournamentView animations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {error && (
          <motion.div {...slideUp} className="mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              variants={cardItemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <Link
                to={`/tournament/${tournament.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>
                  <div className="bg-blue-100/80 p-2 rounded-lg ml-4">
                    <TrophyIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <span>{new Date(tournament.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span className="truncate">{tournament.venue}</span>
                  </div>
                </div>

                {/* Fixed count display - same as TournamentView */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Participants</div>
                      <div className="font-bold text-gray-900">
                        {tournament.participant_count}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Events</div>
                      <div className="font-bold text-gray-900">
                        {tournament.event_count}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {tournaments.length === 0 && (
          <motion.div {...slideUp} className="text-center p-12 bg-white rounded-xl shadow-sm">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <TrophyIcon className="h-full w-full" />
            </div>
            <h3 className="text-gray-900 font-medium text-xl mb-2">
              No tournaments found
            </h3>
            <Link
              to="/tournament/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Tournament
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Dashboard