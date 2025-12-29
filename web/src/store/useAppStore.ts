import type { Session } from '@supabase/supabase-js'
import type { Subscription, SubscriptionVideoView } from '@youtube-rss/types'
import { create } from 'zustand'

interface AppState {
  session: Session | null
  subscriptions: Subscription[]
  videos: SubscriptionVideoView[]
  loading: boolean
  setSession: (session: Session | null) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
  setVideos: (videos: SubscriptionVideoView[]) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  subscriptions: [],
  videos: [],
  loading: false,
  setSession: (session) => set({ session }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setVideos: (videos) => set({ videos }),
  setLoading: (loading) => set({ loading }),
}))
