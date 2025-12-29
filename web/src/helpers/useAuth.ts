import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from './supabaseClient'

export const useAuth = () => {
  const { session, setSession } = useAppStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  return session
}
