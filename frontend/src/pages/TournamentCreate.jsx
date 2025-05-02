import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { motion } from 'framer-motion'

const TournamentCreate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/tournaments/', formData)
      toast.success('Tournament created successfully')
      setTimeout(() => navigate(`/tournament/${response.data.id}`), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create tournament'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date ? date.toISOString().split('T')[0] : ''
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="p-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Create New Tournament
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Tournament Name */}
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 peer transition-all"
                  placeholder=" "
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  Tournament Name *
                </label>
              </div>

              {/* Tournament Date */}
              <div className="relative">
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select Tournament Date"
                  minDate={new Date()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <span className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500">
                  Tournament Date *
                </span>
              </div>

              {/* Venue */}
              <div className="relative">
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 peer transition-all"
                  placeholder=" "
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  Venue *
                </label>
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 peer transition-all"
                  placeholder=" "
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                  Description *
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/dashboard')}
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
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Tournament'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default TournamentCreate