import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const EventSelector = ({ event, isSelected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
      ${isSelected
        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
  >
    <div className="flex items-start space-x-3">
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-900">
            {event.category.replace('_', ' ')}
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => { }} // Handled by parent div click
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
        <div className="mt-1 text-xs text-gray-500 space-y-1">
          <div>{event.age_category} • {event.gender === 'M' ? 'Male' : 'Female'}</div>
          {event.weight_category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {event.weight_category}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ParticipantEdit = () => {
  const { id, participantId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [events, setEvents] = useState([])
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantRes, eventsRes] = await Promise.all([
          axios.get(`/api/participants/${participantId}/`),
          axios.get(`/api/events/?tournament=${id}`)
        ])
        setFormData(participantRes.data)
        setEvents(eventsRes.data)
        setError('')
      } catch (err) {
        setError('Failed to fetch participant data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, participantId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await axios.put(`/api/participants/${participantId}/`, {
        ...formData,
        tournament: id,
        weight: parseFloat(formData.weight)
      })
      setSuccessMessage('Participant updated successfully')
      setTimeout(() => {
        navigate(`/tournament/${id}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update participant')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'events') {
        const eventId = Number(value)
        const updatedEvents = checked
          ? [...formData.events, eventId]
          : formData.events.filter(id => id !== eventId)
        setFormData(prev => ({ ...prev, events: updatedEvents }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/tournament/${id}`)}
        className="group mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
        Back to Tournament
      </button>

      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Participant
          </h2>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {loading || !formData ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Card */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    required
                    className="input-field"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    required
                    className="input-field"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    required
                    className="input-field"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="input-field"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="weight" className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="weight"
                    name="weight"
                    required
                    className="input-field"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="belt_rank" className="form-label">Belt Rank</label>
                  <select
                    id="belt_rank"
                    name="belt_rank"
                    required
                    className="input-field"
                    value={formData.belt_rank}
                    onChange={handleChange}
                  >
                    <option value="9KYU">9th Kyu - White Belt</option>
                    <option value="8KYU">8th Kyu - Yellow Belt</option>
                    <option value="7KYU">7th Kyu - Orange Belt</option>
                    <option value="6KYU">6th Kyu - Green Belt</option>
                    <option value="5KYU">5th Kyu - Blue Belt</option>
                    <option value="4KYU">4th Kyu - Purple Belt</option>
                    <option value="3KYU">3rd Kyu - Brown Belt</option>
                    <option value="2KYU">2nd Kyu - Brown Belt</option>
                    <option value="1KYU">1st Kyu - Brown Belt</option>
                    <option value="1DAN">1st Dan - Black Belt</option>
                    <option value="2DAN">2nd Dan - Black Belt</option>
                    <option value="3DAN">3rd Dan - Black Belt</option>
                    <option value="4DAN">4th Dan - Black Belt</option>
                    <option value="5DAN">5th Dan - Black Belt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="club" className="form-label">Club</label>
                  <input
                    type="text"
                    id="club"
                    name="club"
                    required
                    className="input-field"
                    value={formData.club}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="country" className="form-label">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    className="input-field"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Event Card */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Team Information</h3>
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="is_team_event"
                  name="is_team_event"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.is_team_event}
                  onChange={handleChange}
                />
                <label htmlFor="is_team_event" className="ml-2 block text-sm text-gray-900">
                  This is a team event
                </label>
              </div>

              {formData.is_team_event && (
                <div>
                  <label htmlFor="team_name" className="form-label">Team Name</label>
                  <input
                    type="text"
                    id="team_name"
                    name="team_name"
                    required={formData.is_team_event}
                    className="input-field"
                    value={formData.team_name || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Events Selection Card */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Event Registration</h3>

            {/* Individual Events */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Individual Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter(event => !event.category.includes('TEAM'))
                  .map(event => (
                    <EventSelector
                      key={event.id}
                      event={event}
                      isSelected={formData.events.includes(event.id)}
                      onToggle={() => {
                        const eventId = event.id;
                        const updatedEvents = formData.events.includes(eventId)
                          ? formData.events.filter(id => id !== eventId)
                          : [...formData.events, eventId];
                        setFormData(prev => ({ ...prev, events: updatedEvents }));
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* Team Events */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Team Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter(event => event.category.includes('TEAM'))
                  .map(event => (
                    <EventSelector
                      key={event.id}
                      event={event}
                      isSelected={formData.events.includes(event.id)}
                      onToggle={() => {
                        const eventId = event.id;
                        const updatedEvents = formData.events.includes(eventId)
                          ? formData.events.filter(id => id !== eventId)
                          : [...formData.events, eventId];
                        setFormData(prev => ({ ...prev, events: updatedEvents }));
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/tournament/${id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ParticipantEdit;