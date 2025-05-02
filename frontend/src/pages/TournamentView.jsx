import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ChevronRightIcon,
  RocketLaunchIcon,
  SparklesIcon,
  PlayIcon,
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
    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      await axios.delete(`/api/participants/${participantId}/`);
      setParticipants(participants.filter(p => p.id !== participantId));
    } catch (err) {
      setError('Failed to delete participant');
    }
  };

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Tournament not found'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 pt-8 pb-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
                  {tournament.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex space-x-3">
              <Link
                to={`/tournament/${id}/brackets`}
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                <TrophyIcon className="h-5 w-5 mr-2" />
                Brackets
              </Link>
              <Link
                to={`/tournament/${id}/timer`}
                className="flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                Timer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Participants</p>
                <p className="text-3xl font-bold text-gray-900">{participants.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Events Created</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-3xl font-bold text-gray-900">
                  <span className={getTournamentStatusTextStyle(tournament.status)}>
                    {tournament.status.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                Tournament Actions
              </h3>
              <div className="space-y-3">
                {tournament.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('PUBLISHED')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        <RocketLaunchIcon className="h-5 w-5" />
                        <span>Publish Tournament</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                    </button>

                    {events.length === 0 && (
                      <button
                        onClick={handleGenerateEvents}
                        className={`w-full flex items-center justify-between px-4 py-3 border-2 ${eventsGenerated
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-blue-100 hover:border-blue-200 text-gray-700'
                          } rounded-lg bg-white transition-all group`}
                        disabled={eventsGenerated}
                      >
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="h-5 w-5" />
                          <span>{eventsGenerated ? 'Events Generated' : 'Generate Events'}</span>
                        </div>
                        {!eventsGenerated && <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                      </button>
                    )}
                  </>
                )}

                {tournament.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <PlayIcon className="h-5 w-5" />
                      <span>Start Tournament</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </button>
                )}

                {tournament.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Complete Tournament</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </button>
                )}

                {participants.length === 0 && (
                  <button
                    onClick={addSampleParticipants}
                    className="w-full flex items-center justify-between px-4 py-3 border-2 border-blue-100 hover:border-blue-200 text-gray-700 rounded-lg bg-white transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="h-5 w-5" />
                      <span>Add Sample Participants</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </button>
                )}

                <button
                  onClick={() => navigate(`/tournament/${id}/participants/add`)}
                  className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-blue-100 hover:border-blue-200 text-blue-600 rounded-lg bg-white transition-all group"
                >
                  <div className="flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Participant</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-700">{successMessage}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Participants</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {participants.length} registered competitors
                </p>
              </div>

              {participants.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <UserGroupIcon className="h-full w-full" />
                  </div>
                  <h3 className="text-gray-900 font-medium">No participants yet</h3>
                  <p className="mt-1 text-gray-500">
                    Add participants manually or generate sample entries
                  </p>
                </div>
              ) : (
                  <div className="divide-y divide-gray-100">
                    {participants.map((participant) => (
                      <div key={participant.id} className="group hover:bg-gray-50 transition-colors">
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
                          <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/tournament/${id}/participants/${participant.id}/edit`)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(participant.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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

const getTournamentStatusTextStyle = (status) => {
  switch (status) {
    case 'DRAFT': return 'text-gray-600'
    case 'PUBLISHED': return 'text-blue-600'
    case 'IN_PROGRESS': return 'text-green-600'
    case 'COMPLETED': return 'text-purple-600'
    case 'CANCELLED': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

export default TournamentView