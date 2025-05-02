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

const EventPill = ({ event, selected, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full border transition-colors cursor-pointer
      ${selected
        ? 'border-blue-600 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700'
        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
      }`}
  >
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${selected ? 'bg-blue-600' : 'bg-gray-300'}`} />
      {event.category.replace(/_/g, ' ')}
      {event.weight_category && (
        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          {event.weight_category}
        </span>
      )}
    </div>
  </motion.div>
)

const FloatingInput = ({ label, value, onChange, type = 'text', required = true, ...props }) => (
  <div className="relative w-full">
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent peer transition-all"
      placeholder=" "
      required={required}
      {...props}
    />
    <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all
      peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
      peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
      {label}
    </label>
  </div>
)

const ParticipantEdit = () => {
  const { id, participantId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [formData, setFormData] = useState(null)
  const [filters, setFilters] = useState({
    discipline: 'KATA',
    type: 'INDIVIDUAL',
    ageCategory: 'SENIOR'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantRes, eventsRes] = await Promise.all([
          axios.get(`/api/participants/${participantId}/`),
          axios.get(`/api/events/?tournament=${id}`)
        ])
        setFormData(participantRes.data)
        setEvents(eventsRes.data)
      } catch (error) {
        toast.error('Failed to load participant data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, participantId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put(`/api/participants/${participantId}/`, {
        ...formData,
        tournament: id,
        weight: parseFloat(formData.weight)
      })
      toast.success('Participant updated successfully')
      setTimeout(() => navigate(`/tournament/${id}/participants`), 1500)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEventToggle = (eventId) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(id => id !== eventId)
        : [...prev.events, eventId]
    }))
  }

  if (!formData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="p-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Participants
            </button>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              Edit Participant
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                  <FloatingInput
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <DatePicker
                      selected={formData.date_of_birth ? parse(formData.date_of_birth, 'yyyy-MM-dd', new Date()) : null}
                      onChange={(date) => setFormData({ ...formData, date_of_birth: format(date, 'yyyy-MM-dd') })}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Date of Birth"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500">
                      Date of Birth
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                    <span className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500">
                      Gender
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                  <div className="relative">
                    <select
                      value={formData.belt_rank}
                      onChange={(e) => setFormData({ ...formData, belt_rank: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NIL">Select Belt Rank</option>
                      <option value="9KYU">White Belt</option>
                      <option value="5KYU">Blue Belt</option>
                      <option value="3KYU">Brown Belt</option>
                      <option value="1DAN">Black Belt</option>
                    </select>
                    <span className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500">
                      Belt Rank
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Selection Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Event Registration</h3>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Discipline</label>
                      <select
                        value={filters.discipline}
                        onChange={(e) => setFilters({ ...filters, discipline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="KATA">Kata</option>
                        <option value="KUMITE">Kumite</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="TEAM">Team</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Age Category</label>
                      <select
                        value={filters.ageCategory}
                        onChange={(e) => setFilters({ ...filters, ageCategory: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CADET">Cadet</option>
                        <option value="JUNIOR">Junior</option>
                        <option value="SENIOR">Senior</option>
                      </select>
                    </div>
                  </div>

                  {/* Filtered Events */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events
                      .filter(event =>
                        event.category.includes(filters.discipline) &&
                        event.category.includes(filters.type) &&
                        event.age_category === filters.ageCategory
                      )
                      .map(event => (
                        <EventPill
                          key={event.id}
                          event={event}
                          selected={formData.events.includes(event.id)}
                          onClick={() => handleEventToggle(event.id)}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default ParticipantEdit