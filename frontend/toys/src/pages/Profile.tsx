import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { Home, User, Mail, Phone, Shield, Calendar } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, loading, error } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Home size={20} />
          <span className="font-semibold">Home</span>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-gray-500" />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
