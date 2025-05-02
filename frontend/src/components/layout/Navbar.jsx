import { Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Create Tournament', href: '/tournament/create' },
  { name: 'Timer', href: '/timer' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isCurrentPath = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TMS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isCurrentPath(item.href)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            {/* Mobile Menu */}
            <div className="sm:hidden">
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
                  <span className="sr-only">Open menu</span>
                  <Bars3Icon className="h-6 w-6" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg focus:outline-none">
                    {navigation.map((item) => (
                      <Menu.Item key={item.name}>
                        <Link
                          to={item.href}
                          className={`block px-4 py-2 text-sm ${isCurrentPath(item.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {item.name}
                        </Link>
                      </Menu.Item>
                    ))}
                    <Menu.Item>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden sm:ml-4 sm:flex sm:items-center">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg focus:outline-none">
                    <Menu.Item>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar