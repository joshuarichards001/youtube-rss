import { useEffect } from 'react'
import { supabase } from '../helpers/supabaseClient'
import { useAppStore } from '../store/useAppStore'

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
