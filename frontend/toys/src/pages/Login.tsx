import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data?.user) {
        setError("Unable to login. Please try again.")
        return
      }

      navigate("/profile")
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-frame flex items-center justify-center px-4 py-8">
      <div className="lux-card-elevated w-full max-w-md p-6 sm:p-8">
        <p className="lux-chip lux-chip-accent w-fit">Welcome back</p>
        <h1 className="lux-title mt-3 text-3xl sm:text-4xl">Log in</h1>
        <p className="lux-subtitle mt-2">Return to your account and keep shopping.</p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[rgba(255,109,141,0.28)] bg-[rgba(255,109,141,0.12)] p-3 text-sm text-[#ffd3dd]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="Your password"
            />
          </label>

          <button type="submit" disabled={loading} className="lux-primary w-full rounded-xl px-4 py-3 disabled:opacity-60">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[color:var(--text-muted)]">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold text-[#d4af37] hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
