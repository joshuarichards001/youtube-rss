import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { fetchYouTubeSubscriptions } from './youtubeAPI'
import { fetchVideos } from './supabaseFunctions'

export const useSubscriptionSync = () => {
  const { session, setSubscriptions, setLoading, setVideos } = useAppStore()
  const lastSyncedToken = useRef<string | null>(null)

  useEffect(() => {
    const currentToken = session?.provider_token
    if (currentToken && session?.access_token && currentToken !== lastSyncedToken.current) {
      lastSyncedToken.current = currentToken
      setLoading(true)
      fetchYouTubeSubscriptions(currentToken, session.access_token)
        .then((subs) => {
          setSubscriptions(subs)
          fetchVideos().then((videos) => setVideos(videos))
        })
        .finally(() => setLoading(false))
    }
  }, [session, setSubscriptions, setLoading])
}
