import { type Session } from '@supabase/supabase-js'
import type { Subscription, SubscriptionVideoView } from '@youtube-rss/types'
import { useEffect, useRef, useState } from 'react'
import Login from './Login'
import { supabase } from './supabaseClient'
import { fetchYouTubeSubscriptions } from './youtubeAPI'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [videos, setVideos] = useState<SubscriptionVideoView[]>([])
  const [loading, setLoading] = useState(false)
  const lastSyncedToken = useRef<string | null>(null)

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
  }, [])

  const fetchVideos = async () => {
    try {
      const { data: vids, error: vidError } = await supabase
        .from('subscription_videos')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (vidError) throw vidError

      setVideos(vids || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  useEffect(() => {
    const currentToken = session?.provider_token
    if (currentToken && session?.access_token && currentToken !== lastSyncedToken.current) {
      lastSyncedToken.current = currentToken
      setLoading(true)
      // Sync subscriptions first
      fetchYouTubeSubscriptions(currentToken, session.access_token)
        .then((subs) => {
          setSubscriptions(subs)
          // Then fetch videos
          return fetchVideos()
        })
        .finally(() => setLoading(false))
    }
  }, [session])

  if (!session) {
    return <Login />
  }

  return (
    <div className="p-4 flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">YouTube RSS Feed</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm opacity-70">Logged in as: {session.user.email}</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>

      {session.provider_token ? (
        <div className="alert alert-success shadow-md">
          <span>YouTube connected! {loading ? 'Syncing...' : 'Up to date.'}</span>
        </div>
      ) : (
        <div className="alert alert-warning shadow-md">
          <span>
            Missing YouTube access. Please sign out and sign in again if subscriptions don't load.
          </span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.video_id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200">
              <figure className="relative aspect-video">
                <img
                  src={video.video_thumbnail}
                  alt={video.video_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 badge badge-neutral bg-opacity-80">
                  {new Date(video.published_at).toLocaleDateString()}
                </div>
              </figure>
              <div className="card-body p-4">
                <div className="badge badge-outline mb-2 text-xs">
                  {video.channel_title || 'Unknown Channel'}
                </div>
                <h3 className="card-title text-base leading-tight line-clamp-2" title={video.video_title}>
                  <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {video.video_title}
                  </a>
                </h3>
                <div className="card-actions justify-end mt-4">
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-full"
                  >
                    Watch Now
                  </a>
                </div>
              </div>
            </div>
          ))}
          {videos.length === 0 && !loading && (
            <div className="col-span-full text-center py-10 opacity-50">
              No videos found. Subscriptions might still be syncing.
            </div>
          )}
        </div>
      </div>

      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">
          Your Subscriptions ({subscriptions.length})
        </div>
        <div className="collapse-content">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="card bg-base-100 shadow-sm text-xs">
                <figure className="px-2 pt-2">
                  <img
                    src={sub.thumbnail}
                    alt={sub.title}
                    className="rounded-full w-16 h-16"
                  />
                </figure>
                <div className="card-body p-2 items-center text-center">
                  <p className="font-bold truncate w-full">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
