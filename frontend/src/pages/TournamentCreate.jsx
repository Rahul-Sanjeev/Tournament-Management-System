import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <button
        onClick={() => navigate('/dashboard')}
        className="group mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
        Back to Dashboard
      </button>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Tournament</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Tournament Name */}
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Tournament Name
                </label>
              </div>

              {/* Visible Date Input */}
              <div className="relative">
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select tournament date"
                  minDate={new Date()}
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom-start"
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Tournament Date
                </label>
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
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Venue
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
                  className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600">
                  Description
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TournamentCreate