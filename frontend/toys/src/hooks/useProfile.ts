import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          // If auth session is missing, user is not logged in - this is expected
          if (userError.message.includes('Auth session missing') || userError.name === 'AuthSessionMissingError') {
            setProfile(null)
            setLoading(false)
            return
          }
          throw userError
        }

        if (!user) {
          setProfile(null)
          return
        }

        // Fetch the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        setProfile(data)
      } catch (err) {
        const error = err as Error
        // Don't log AuthSessionMissingError as it's expected when user is not logged in
        if (!error.message.includes('Auth session missing') && error.name !== 'AuthSessionMissingError') {
          console.error('Error fetching profile:', err)
        }
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}