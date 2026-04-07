import { useEffect, useRef } from 'react'
import { fetchVideos } from '../helpers/supabaseFunctions'
import { fetchYouTubeSubscriptions } from '../helpers/youtubeAPI'
import { useAppStore } from '../store/useAppStore'

export const useSubscriptionSync = () => {
  const { session, setSubscriptions, setLoading, setVideos, setProgress, setHasMoreVideos } = useAppStore()
  const lastSyncedToken = useRef<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Setup SSE Connection
  useEffect(() => {
    if (!session?.access_token) return

    const setupEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Pass token in query param for EventSource
      const url = new URL('/api/sse', import.meta.env.VITE_API_URL || 'http://localhost:3000')
      url.searchParams.append('token', session.access_token)

      const es = new EventSource(url.toString())

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setProgress(data)

          if (data.status === 'completed') {
            fetchVideos().then((vids) => {
              setVideos(vids)
              setHasMoreVideos(vids.length === 50)
            })
            setTimeout(() => {
              setProgress({ status: 'idle', processed: 0, total: 0, message: '' })
            }, 5000)
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err)
        }
      }

      es.onerror = (err) => {
        console.error('SSE Error:', err)
        es.close()
      }

      eventSourceRef.current = es
    }

    setupEventSource()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [session, setProgress, setVideos])

  // Trigger Sync
  useEffect(() => {
    const currentToken = session?.provider_token
    if (currentToken && session?.access_token && currentToken !== lastSyncedToken.current) {
      lastSyncedToken.current = currentToken
      setLoading(true)
      fetchYouTubeSubscriptions(currentToken, session.access_token)
        .then((subs) => {
          setSubscriptions(subs)
          fetchVideos().then((vids) => {
            setVideos(vids)
            setHasMoreVideos(vids.length === 50)
          })
        })
        .finally(() => setLoading(false))
    }
  }, [session, setSubscriptions, setLoading, setVideos])
}
