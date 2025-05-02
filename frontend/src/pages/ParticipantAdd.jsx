import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import { format, parse } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import { motion } from 'framer-motion'

const EventSelector = ({ event, isSelected, onToggle }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onToggle}
    className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
      ${isSelected
      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-600/20'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
  >
    <div className="flex items-start space-x-3">
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-900">
            {event.category.replace('_', ' ')}
          </div>
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
            {isSelected && (
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
              </svg>
            )}
          </div>
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
  </motion.div>
)

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
      className="block w-full px-4 py-3 text-gray-900 placeholder-transparent border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer transition-all"
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-blue-600"
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
  const [modifiedFields, setModifiedFields] = useState(new Set())
  const [events, setEvents] = useState([])
  const [filters, setFilters] = useState({
    discipline: 'KATA',
    eventType: 'INDIVIDUAL',
    ageCategory: 'SENIOR'
  })

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

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="p-8">
          <button
            onClick={() => navigate(`/tournament/${id}`)}
            className="group mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
            Back to Tournament
          </button>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Add New Participant
          </h2>

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
                      })
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600">
                    Date of Birth
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600">
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
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="NIL">Not Applicable</option>
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
                  <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600">
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
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Registration</h3>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Discipline</label>
                  <select
                    value={filters.discipline}
                    onChange={(e) => handleFilterChange('discipline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="KATA">Kata</option>
                    <option value="KUMITE">Kumite</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Event Type</label>
                  <select
                    value={filters.eventType}
                    onChange={(e) => handleFilterChange('eventType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="TEAM">Team</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age Category</label>
                  <select
                    value={filters.ageCategory}
                    onChange={(e) => handleFilterChange('ageCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CADET">Cadet</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>
              </div>

              {/* Filtered Events */}
              <div className="space-y-6">
                {events
                  .filter(event =>
                    event.category.includes(filters.discipline) &&
                    event.category.includes(filters.eventType) &&
                    event.age_category === filters.ageCategory &&
                    event.gender === formData.gender
                  )
                  .map((event, index) => (
                    <div key={event.id} className="space-y-4">
                      {index === 0 && (
                        <h4 className="text-lg font-semibold text-gray-800">
                          {filters.discipline} - {filters.eventType} ({filters.ageCategory})
                        </h4>
                      )}
                      <EventSelector
                        event={event}
                        isSelected={formData.events.includes(event.id)}
                        onToggle={() => {
                          const updatedEvents = formData.events.includes(event.id)
                            ? formData.events.filter(id => id !== event.id)
                            : [...formData.events, event.id]
                          setFormData(prev => ({ ...prev, events: updatedEvents }))
                        }}
                      />
                    </div>
                  ))}
              </div>

              {/* Weight Category Legend */}
              {filters.discipline === 'KUMITE' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Weight Categories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      -50kg
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      -55kg
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      -60kg
                    </span>
                    {/* Add more weight categories as needed */}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate(`/tournament/${id}`)}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Participant'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ParticipantAdd