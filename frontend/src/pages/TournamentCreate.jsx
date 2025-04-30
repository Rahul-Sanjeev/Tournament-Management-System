import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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

  const FloatingLabelTextarea = ({ id, label, rows = 4, required = true, value, onChange, ...props }) => (
    <div className="relative">
      <textarea
        id={id}
        name={id}
        rows={rows}
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
        <div className="space-y-8">
          <div className="space-y-6">
            <FloatingLabelInput
              id="name"
              label="Tournament Name"
              value={formData.name}
              onChange={handleChange}
            />
            <FloatingLabelInput
              id="date"
              label="Tournament Date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            <FloatingLabelInput
              id="venue"
              label="Venue"
              value={formData.venue}
              onChange={handleChange}
            />
            <FloatingLabelTextarea
              id="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Tournament'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentCreate