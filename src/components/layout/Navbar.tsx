import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { History, LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AEEMCI</h1>
              <p className="text-xs text-gray-500">Section ESATIC</p>
            </div>
          </Link>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <Link to="/history">
                <Button variant="ghost" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Historique
                </Button>
              </Link>

              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {profile?.nom_complet || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.delegation}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
