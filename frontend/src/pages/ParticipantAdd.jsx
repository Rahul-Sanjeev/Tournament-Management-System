import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const EventSelector = ({ event, isSelected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
      ${isSelected
        ? 'border-karate-blue bg-blue-50 ring-2 ring-karate-blue/20'
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

const FloatingLabelInput = ({ id, label, type = 'text', required = true, value, onChange, ...props }) => (
  <div className="relative">
    <input
      id={id}
      name={id}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder=" "
      className="block w-full px-4 py-3 text-gray-900 placeholder-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-2 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-blue-600"
    >
      {label}
    </label>
  </div>
)

const ParticipantAdd = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [events, setEvents] = useState([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'M',
    weight: '',
    belt_rank: 'NIL',
    club: '',
    district: '',
    state: 'Kerala',
    country: 'India',
    is_team_event: false,
    team_name: '',
    events: []
  })

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/api/events/?tournament=${id}`)
        setEvents(response.data)
      } catch (err) {
        setError('Failed to fetch events')
      }
    }
    fetchEvents()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/participants/', {
        ...formData,
        tournament: id,
        weight: parseFloat(formData.weight)
      })
      toast.success('Participant added successfully')
      setTimeout(() => navigate(`/tournament/${id}`), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add participant'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setModifiedFields(prev => new Set([...prev, name]))

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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Back Button */}
      <button
        onClick={() => navigate(`/tournament/${id}`)}
        className="group mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
        Back to Tournament
      </button>

      {/* Form Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Participant</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FloatingLabelInput
                id="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleChange}
              />
              <FloatingLabelInput
                id="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <DatePicker
                  id="date_of_birth"
                  selected={formData.date_of_birth ? parse(formData.date_of_birth, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(date) => {
                    handleChange({
                      target: {
                        name: 'date_of_birth',
                        value: date ? format(date, 'yyyy-MM-dd') : ''
                      }
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  showYearDropdown
                  dropdownMode="select"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Date of Birth
                </label>
              </div>


              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <label className="absolute left-2 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Gender
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FloatingLabelInput
                id="weight"
                label="Weight (kg)"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
              />
              <div className="relative">
                <select
                  id="belt_rank"
                  name="belt_rank"
                  value={formData.belt_rank}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="NIL">Not Applicable</option> {/* Default first */}
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
                <label className="absolute left-2 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Belt Rank
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FloatingLabelInput
                id="club"
                label="Club"
                value={formData.club}
                onChange={handleChange}
              />
              <FloatingLabelInput
                id="district"
                label="District"
                value={formData.district}
                onChange={handleChange}
              />
              <FloatingLabelInput
                id="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
              />
              <FloatingLabelInput
                id="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Events Selection */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Event Registration</h3>

            {/* Individual Events */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Individual Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter(event =>
                    !event.category.includes('TEAM') &&
                    event.gender === formData.gender
                  )
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
                  .filter(event =>
                    event.category.includes('TEAM') &&
                    event.gender === formData.gender
                  )
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
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
                  Adding...
                </div>
              ) : (
                'Add Participant'
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  )
}

export default ParticipantAdd