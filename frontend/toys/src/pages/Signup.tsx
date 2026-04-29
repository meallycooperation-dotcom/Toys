import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please complete all fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!user) {
        setError("Unable to create account. Please try again.")
        return
      }

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          name,
          email,
          phone,
        },
      ])

      if (profileError) {
        throw profileError
      }

      setSuccess("Account created successfully. You may need to verify your email before logging in.")
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
        <p className="lux-chip lux-chip-accent w-fit">Join the collection</p>
        <h1 className="lux-title mt-3 text-3xl sm:text-4xl">Create an account</h1>
        <p className="lux-subtitle mt-2">Set up your profile and start shopping in style.</p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[rgba(255,109,141,0.28)] bg-[rgba(255,109,141,0.12)] p-3 text-sm text-[#ffd3dd]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-[rgba(140,230,154,0.28)] bg-[rgba(140,230,154,0.1)] p-3 text-sm text-[#d9fce0]">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="Full name"
            />
          </label>

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
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="(123) 456-7890"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="Enter a password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--text-muted)]">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="lux-field mt-1 block px-4 py-3"
              placeholder="Confirm your password"
            />
          </label>

          <button type="submit" disabled={loading} className="lux-primary w-full rounded-xl px-4 py-3 disabled:opacity-60">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[color:var(--text-muted)]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-[#d4af37] hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}
