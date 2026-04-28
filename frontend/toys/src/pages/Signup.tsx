import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please complete all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
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
        setError('Unable to create account. Please try again.')
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert([
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

      setSuccess('Account created successfully. You may need to verify your email before logging in.')
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
        <h1 className="text-2xl font-bold text-center mb-4">Create an account</h1>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Full name"
            />
          </label>

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
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="(123) 456-7890"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter a password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Confirm your password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}
