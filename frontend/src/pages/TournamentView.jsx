import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ClockIcon, TrophyIcon, CalendarIcon, MapPinIcon as LocationMarkerIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

const TournamentView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState([])
  const [events, setEvents] = useState([]) // Added to track events
  const [successMessage, setSuccessMessage] = useState(null) // Added for feedback

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const [tournamentRes, participantsRes, eventsRes] = await Promise.all([
          axios.get(`/api/tournaments/${id}/`),
          axios.get(`/api/participants/?tournament=${id}`),
          axios.get(`/api/events/?tournament=${id}`) // Fetch events
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

  const addSampleParticipants = async () => {
    try {
      await axios.post(`/api/tournaments/${id}/add-sample-participants/`)
      const participantsRes = await axios.get(`/api/participants/?tournament=${id}`)
      setParticipants(participantsRes.data)
      setSuccessMessage('Sample participants added successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to add sample participants. Ensure events are generated first.')
    }
  }

  const handleGenerateEvents = async () => {
    try {
      await axios.post(`/api/tournaments/${id}/generate_events/`);
      const eventsRes = await axios.get(`/api/events/?tournament=${id}`);
      setEvents(eventsRes.data);
      setSuccessMessage('Events generated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // After generating events, add sample participants
      await axios.post(`/api/tournaments/${id}/add-sample-participants/`);
      const participantsRes = await axios.get(`/api/participants/?tournament=${id}`);
      setParticipants(participantsRes.data);
      setSuccessMessage('Sample participants added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to generate events or add participants');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karate-blue"></div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {tournament.name}
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {new Date(tournament.date).toLocaleDateString()}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <LocationMarkerIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {tournament.venue}
            </div>
            <div className="mt-2 flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getTournamentStatusStyle(tournament.status)}`}
              >
                {tournament.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link
            to={`/tournament/${id}/brackets`}
            className="btn-primary flex items-center"
          >
            <TrophyIcon className="h-5 w-5 mr-2" />
            Manage Brackets
          </Link>
          <Link
            to={`/tournament/${id}/timer`}
            className="btn-secondary flex items-center"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Timer
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Tournament Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Tournament Actions
          </h3>
          <div className="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
            {tournament.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => handleStatusChange('PUBLISHED')}
                  className="btn-primary w-full sm:w-auto"
                >
                  Publish Tournament
                </button>
                <button
                  onClick={handleGenerateEvents}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Generate Events
                </button>
              </>
            )}
            {tournament.status === 'PUBLISHED' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="btn-primary w-full sm:w-auto"
              >
                Start Tournament
              </button>
            )}
            {tournament.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="btn-primary w-full sm:w-auto"
              >
                Complete Tournament
              </button>
            )}
            {participants.length === 0 && (
              <button
                onClick={addSampleParticipants}
                className="btn-secondary w-full sm:w-auto"
              >
                Add Sample Participants
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participant List */}
      <div className="card fade-in">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Participants ({participants.length})
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage tournament participants and their event registrations
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <button
                onClick={() => navigate(`/tournament/${id}/participants/add`)}
                className="btn-primary"
              >
                Add Participant
              </button>
            </div>
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No participants</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new participant or generating events first.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/tournament/${id}/participants/add`)}
                  className="btn-primary"
                >
                  Add Participant
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Gender
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Age
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Weight
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Belt
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Club
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex items-center">
                              <div>
                                <div className="font-medium text-gray-900">{participant.full_name}</div>
                                {participant.is_team_event && (
                                  <div className="mt-1">
                                    <span className="badge badge-blue">{participant.team_name || 'Unnamed Team'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.gender === 'M' ? 'Male' : 'Female'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.age}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.weight ? `${participant.weight} kg` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="badge badge-gray">
                              {participant.belt_rank}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.club || '-'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/tournament/${id}/participants/${participant.id}/edit`)}
                                className="text-karate-blue hover:text-karate-blue/80"
                              >
                                <PencilIcon className="h-5 w-5" />
                                <span className="sr-only">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(participant.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-5 w-5" />
                                <span className="sr-only">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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

export default TournamentView