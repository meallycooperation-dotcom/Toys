import { Calendar, Home, Mail, Package, Phone, Shield, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { useProfile } from "../hooks/useProfile"

export default function Profile() {
  const navigate = useNavigate()
  const { profile, loading, error } = useProfile()

  if (loading) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[rgba(212,175,55,0.35)] border-t-[#be123c]" />
          <p className="lux-subtitle mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button onClick={() => window.location.reload()} className="lux-primary rounded-full px-4 py-2">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-frame flex items-center justify-center px-4">
        <div className="lux-card-elevated w-full max-w-sm px-8 py-10 text-center">
          <p className="lux-subtitle mb-6">Please log in to view your profile</p>
          <div className="space-y-3">
            <button onClick={() => navigate("/login")} className="lux-primary w-full rounded-xl px-4 py-3">
              Login
            </button>
            <button onClick={() => navigate("/signup")} className="lux-secondary w-full rounded-xl px-4 py-3">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-frame px-4 py-4">
      <Seo
        title="Profile"
        description="View and manage your Toys profile, saved details, and order history."
        path="/profile"
        noIndex
      />
      <div className="lux-header sticky top-0 z-20 rounded-2xl px-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[color:var(--text-primary)] transition hover:text-[#d4af37]"
        >
          <Home size={20} />
          <span className="font-semibold">Home</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        <div className="lux-card-elevated p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.06)]">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-[color:var(--text-muted)]" />
              )}
            </div>

            <div>
              <p className="lux-chip lux-chip-accent">Member profile</p>
              <h1 className="lux-title mt-3 text-3xl sm:text-4xl">
                {profile.name || "Guest"}
              </h1>
              <p className="lux-subtitle mt-2">{profile.email || "No email provided"}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="lux-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Name</p>
                  <p className="font-medium">{profile.name || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="lux-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Email</p>
                  <p className="font-medium">{profile.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="lux-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Phone</p>
                  <p className="font-medium">{profile.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="lux-panel-soft rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Role</p>
                  <p className="font-medium capitalize">{profile.role}</p>
                </div>
              </div>
            </div>

            <div className="lux-panel-soft rounded-2xl p-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Member since</p>
                  <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="lux-panel-soft flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:border-[rgba(212,175,55,0.28)] hover:bg-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
                  <Package size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <p className="font-semibold">Orders</p>
                  <p className="text-sm text-[color:var(--text-muted)]">View your purchase history</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#d4af37]">Open</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
