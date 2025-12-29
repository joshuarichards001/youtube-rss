import { type Session } from '@supabase/supabase-js'
import type { Subscription } from '@youtube-rss/types'
import { useEffect, useState } from 'react'
import Login from './Login'
import { supabase } from './supabaseClient'
import { fetchYouTubeSubscriptions } from './youtubeAPI'
function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

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

  useEffect(() => {
    if (session?.provider_token) {
      fetchYouTubeSubscriptions(session.provider_token).then(setSubscriptions)
    }
  }, [session])

  if (!session) {
    return <Login />
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">YouTube RSS</h1>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>

      {session.provider_token ? (
        <div className="alert alert-success">
          <span>YouTube connected!</span>
        </div>
      ) : (
        <div className="alert alert-warning">
          <span>
            Missing YouTube access. Please sign out and sign in again if subscriptions don't load.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="card bg-base-100 shadow-xl">
            <figure className="px-4 pt-4">
              <img
                src={sub.thumbnail}
                alt={sub.title}
                className="rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">{sub.title}</h2>
              <p className="text-sm opacity-70 truncate max-w-full">
                {sub.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p>Logged in as: {session.user.email}</p>
      </div>
    </div>
  )
}

export default App
