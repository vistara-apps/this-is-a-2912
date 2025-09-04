import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Home, 
  Timer, 
  TrendingUp, 
  BookOpen, 
  Settings,
  LogOut,
  Hourglass
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
]

export const AppShell = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="glass-dark backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Hourglass className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold text-white">FastFlow</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <NavLink
                to="/settings"
                className={({ isActive }) => clsx(
                  'p-2 rounded-lg transition-colors duration-150',
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <Settings className="h-5 w-5" />
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden md:flex w-64 min-h-screen glass-dark backdrop-blur-xl border-r border-white/10">
          <div className="flex flex-col w-full p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150',
                  isActive 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-dark backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                'flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-150',
                isActive 
                  ? 'text-primary' 
                  : 'text-white/70'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}