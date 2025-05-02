import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

// Animation variants
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

const TournamentView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState([])
  const [events, setEvents] = useState([])
  const [eventsGenerated, setEventsGenerated] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const [tournamentRes, participantsRes, eventsRes] = await Promise.all([
          axios.get(`/api/tournaments/${id}/`),
          axios.get(`/api/participants/?tournament=${id}`),
          axios.get(`/api/events/?tournament=${id}`)
        ])
        setTournament(tournamentRes.data)
        setParticipants(participantsRes.data)
        setEvents(eventsRes.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch tournament data')
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentData()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.patch(`/api/tournaments/${id}/`, {
        status: newStatus
      })
      setTournament(response.data)
    } catch (err) {
      setError('Failed to update tournament status')
    }
  }

  const handleDeleteParticipant = async (participantId) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) return

    try {
      await axios.delete(`/api/participants/${participantId}/`)
      setParticipants(participants.filter(p => p.id !== participantId))
    } catch (err) {
      setError('Failed to delete participant')
    }
  }

  const handleGenerateEvents = async () => {
    try {
      await axios.post(`/api/tournaments/${id}/generate_events/`)
      const eventsRes = await axios.get(`/api/events/?tournament=${id}`)
      setEvents(eventsRes.data)
      setSuccessMessage('Events generated successfully')
      setEventsGenerated(true)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to generate events')
    }
  }

  const addSampleParticipants = async () => {
    try {
      await axios.post(`/api/tournaments/${id}/add-sample-participants/`)
      const participantsRes = await axios.get(`/api/participants/?tournament=${id}`)
      setParticipants(participantsRes.data)
      setSuccessMessage('Sample participants added successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to add sample participants')
    }
  }

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </motion.div>
    )
  }

  if (error || !tournament) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        {...fadeIn}
      >
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
            <span className="text-sm text-red-700">{error || 'Tournament not found'}</span>
          </div>
        </div>
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 pt-8 pb-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-200">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{new Date(tournament.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{tournament.venue}</span>
                </div>
                <span className={`badge ${getTournamentStatusStyle(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 md:mt-0 flex space-x-3"
            >
              <Link
                to={`/tournament/${id}/brackets`}
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrophyIcon className="h-5 w-5 mr-2" />
                Brackets
              </Link>
              <Link
                to={`/tournament/${id}/timer`}
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                Timer
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[
            { icon: UserGroupIcon, title: 'Participants', value: participants.length, color: 'blue' },
            { icon: ChartBarIcon, title: 'Events Created', value: events.length, color: 'purple' },
            { icon: CalendarIcon, title: 'Status', value: tournament.status, color: 'green' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              {...slideUp}
            >
              <h3 className="text-lg font-semibold mb-4">Tournament Actions</h3>
              <div className="space-y-3">
                {tournament.status === 'DRAFT' && (
                  <>
                    <motion.button
                      onClick={() => handleStatusChange('PUBLISHED')}
                      className="w-full btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Publish Tournament
                    </motion.button>
                    {events.length === 0 && (
                      <motion.button
                        onClick={handleGenerateEvents}
                        className="w-full btn-secondary"
                        disabled={eventsGenerated}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {eventsGenerated ? '✓ Events Generated' : 'Generate Events'}
                      </motion.button>
                    )}
                  </>
                )}

                {tournament.status === 'PUBLISHED' && (
                  <motion.button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Tournament
                  </motion.button>
                )}

                {tournament.status === 'IN_PROGRESS' && (
                  <motion.button
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="w-full btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Complete Tournament
                  </motion.button>
                )}

                {participants.length === 0 && (
                  <motion.button
                    onClick={addSampleParticipants}
                    className="w-full btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Sample Participants
                  </motion.button>
                )}

                <motion.button
                  onClick={() => navigate(`/tournament/${id}/participants/add`)}
                  className="w-full btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Participant
                </motion.button>
              </div>
            </motion.div>

            {/* Status Messages */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"
                  {...slideUp}
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-sm text-green-700">{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
                  {...slideUp}
                >
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Participants List */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              {...slideUp}
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Participants</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {participants.length} registered competitors
                </p>
              </div>

              <AnimatePresence>
                {participants.length === 0 ? (
                  <motion.div
                    className="p-12 text-center"
                    {...fadeIn}
                  >
                    <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                      <UserGroupIcon className="h-full w-full" />
                    </div>
                    <h3 className="text-gray-900 font-medium">No participants yet</h3>
                    <p className="mt-1 text-gray-500">
                      Add participants manually or generate sample entries
                    </p>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {participants.map((participant) => (
                        <motion.div
                          key={participant.id}
                          variants={listItem}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="group hover:bg-gray-50 transition-colors participant-card"
                        >
                          <div className="flex items-center px-6 py-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {participant.full_name[0]}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {participant.full_name}
                                    {participant.is_team_event && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Team: {participant.team_name || 'Unnamed'}
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span className="mr-1.5">⚤</span>
                                      {participant.gender === 'M' ? 'Male' : 'Female'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span className="mr-1.5">🎂</span>
                                      {participant.age} years
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span className="mr-1.5">⚖️</span>
                                      {participant.weight ? `${participant.weight}kg` : '-'}
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                      {participant.belt_rank}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <motion.div
                              className="flex items-center space-x-4 opacity-0 group-hover:opacity-100"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: {
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 20
                                }
                              }}
                            >
                              <button
                                onClick={() => navigate(`/tournament/${id}/participants/${participant.id}/edit`)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(participant.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Style helpers
const getTournamentStatusStyle = (status) => {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800 p-1 rounded-lg'
    case 'PUBLISHED': return 'bg-blue-100 text-blue-800 p-1 rounded-lg'
    case 'IN_PROGRESS': return 'bg-green-100 text-green-800 p-1 rounded-lg'
    case 'COMPLETED': return 'bg-purple-100 text-purple-800 p-1 rounded-lg'
    case 'CANCELLED': return 'bg-red-100 text-red-800 p-1 rounded-lg'
    default: return 'bg-gray-100 text-gray-800 p-1 rounded'
  }
}

export default TournamentView