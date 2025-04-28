import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';  // fixed import path

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Both fields are required');
      return;
    }
    const result = await login(username, password, remember);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-75 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center">Sign in to your account</h2>
        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>
        {/* <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:text-blue-500">
            Sign up
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Login;





// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
// import { ToastContainer, toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

// const Login = () => {
//   const navigate = useNavigate()
//   const { login, requestPasswordReset } = useAuth()
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     rememberMe: false
//   })
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [isResettingPassword, setIsResettingPassword] = useState(false)
//   const [resetEmail, setResetEmail] = useState('')
//   const [resetMessage, setResetMessage] = useState('')
//   const [showPassword, setShowPassword] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const result = await login(formData.username, formData.password, formData.rememberMe)
//       if (result.success) {
//         toast.success('Successfully logged in!')
//         navigate('/dashboard')
//       } else {
//         toast.error(result.error)
//         setError(result.error)
//       }
//     } catch (err) {
//       const errorMsg = 'An unexpected error occurred'
//       toast.error(errorMsg)
//       setError(errorMsg)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePasswordReset = async (e) => {
//     e.preventDefault()
//     setResetMessage('')
//     setLoading(true)

//     try {
//       const result = await requestPasswordReset(resetEmail)
//       if (result.success) {
//         setResetMessage('Password reset instructions have been sent to your email')
//         setIsResettingPassword(false)
//       } else {
//         setError(result.error)
//       }
//     } catch (err) {
//       setError('Failed to send password reset email')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }))
//   }

//   if (isResettingPassword) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//               Reset Password
//             </h2>
//           </div>
//           <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
//             {error && (
//               <div className="rounded-md bg-red-50 p-4">
//                 <div className="text-sm text-red-700">{error}</div>
//               </div>
//             )}
//             {resetMessage && (
//               <div className="rounded-md bg-green-50 p-4">
//                 <div className="text-sm text-green-700">{resetMessage}</div>
//               </div>
//             )}
//             <div>
//               <label htmlFor="email" className="sr-only">Email address</label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-karate-blue focus:border-karate-blue focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={resetEmail}
//                 onChange={(e) => setResetEmail(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <button
//                 type="button"
//                 onClick={() => setIsResettingPassword(false)}
//                 className="text-sm text-karate-blue hover:text-opacity-90"
//               >
//                 Back to login
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-karate-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karate-blue disabled:opacity-50"
//               >
//                 {loading ? (
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 ) : (
//                   'Send Reset Instructions'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <ToastContainer position="top-right" autoClose={3000} />
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to your account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="text-sm text-red-700">{error}</div>
//             </div>
//           )}
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="username" className="sr-only">Username</label>
//               <input
//                 id="username"
//                 name="username"
//                 type="text"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-karate-blue focus:border-karate-blue focus:z-10 sm:text-sm"
//                 placeholder="Username"
//                 value={formData.username}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="relative">
//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-karate-blue focus:border-karate-blue focus:z-10 sm:text-sm pr-10"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 flex items-center pr-3"
//               >
//                 {showPassword ? (
//                   <EyeSlashIcon className="h-5 w-5 text-gray-400" />
//                 ) : (
//                   <EyeIcon className="h-5 w-5 text-gray-400" />
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="rememberMe"
//                 name="rememberMe"
//                 type="checkbox"
//                 className="h-4 w-4 text-karate-blue focus:ring-karate-blue border-gray-300 rounded"
//                 checked={formData.rememberMe}
//                 onChange={handleChange}
//               />
//               <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <button
//                 type="button"
//                 onClick={() => setIsResettingPassword(true)}
//                 className="font-medium text-karate-blue hover:text-opacity-90"
//               >
//                 Forgot your password?
//               </button>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-blue-100 hover:bg-opacity-90  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue disabled:opacity-50"
//             >
//               {loading ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               ) : (
//                 'Sign in'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
// export default Login
