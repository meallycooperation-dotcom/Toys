import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Email and password are required.')
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
        setError('Unable to login. Please try again.')
        return
      }

      navigate('/profile')
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Log in</h1>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Your password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Need an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
