import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  MapPinIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
  TrophyIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

// Animation configurations
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 }
}

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20 }
  }
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

const hoverCard = {
  scale: 1.02,
  boxShadow: '0px 20px 40px -10px rgba(0, 0, 0, 0.1)',
  transition: { type: 'spring', stiffness: 300 }
}

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 pt-8 pb-24 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Tournaments
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                className="text-gray-200 font-medium"
              >
                Manage your martial arts competitions
              </motion.p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-6 md:mt-0"
            >
              <Link
                to="/tournament/create"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-all hover:shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Tournament
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {error && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8"
          >
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {tournaments.length === 0 ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-gray-100"
          >
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <TrophyIcon className="h-full w-full" />
            </div>
            <h3 className="text-gray-900 font-medium text-xl mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/tournament/create"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium inline-flex items-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Tournament
              </Link>
            </motion.div>
          </motion.div>
        ) : (
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
                whileHover={hoverCard}
                className="relative"
              >
                <Link
                  to={`/tournament/${tournament.id}`}
                  className="group bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 block h-full"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {tournament.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {tournament.description}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-blue-100/80 p-2 rounded-lg ml-4"
                      >
                        <TrophyIcon className="h-6 w-6 text-blue-600" />
                      </motion.div>
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

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-blue-100 rounded-lg"
                        >
                          <UserGroupIcon className="h-5 w-5 text-blue-600" />
                        </motion.div>
                        <div>
                          <div className="text-xs text-gray-500">Participants</div>
                          <div className="font-bold text-gray-900">
                            {tournament.participant_count || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-purple-100 rounded-lg"
                        >
                          <ChartBarIcon className="h-5 w-5 text-purple-600" />
                        </motion.div>
                        <div>
                          <div className="text-xs text-gray-500">Events</div>
                          <div className="font-bold text-gray-900">
                            {tournament.event_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"
                    style={{ originX: 0 }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Dashboard