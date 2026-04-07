import type { Session } from '@supabase/supabase-js'
import type { Subscription, SubscriptionVideoView } from '@youtube-rss/types'
import { create } from 'zustand'

interface AppState {
  session: Session | null
  authLoaded: boolean
  subscriptions: Subscription[]
  videos: SubscriptionVideoView[]
  loading: boolean
  showShorts: boolean
  progress: { status: 'idle' | 'starting' | 'progress' | 'completed' | 'error'; processed: number; total: number; message: string }
  setSession: (session: Session | null) => void
  setAuthLoaded: (loaded: boolean) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
  setVideos: (videos: SubscriptionVideoView[]) => void
  setLoading: (loading: boolean) => void
  setShowShorts: (showShorts: boolean) => void
  setProgress: (progress: AppState['progress']) => void
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  authLoaded: false,
  subscriptions: [],
  videos: [],
  loading: false,
  showShorts: false,
  progress: { status: 'idle', processed: 0, total: 0, message: '' },
  setSession: (session) => set({ session }),
  setAuthLoaded: (authLoaded) => set({ authLoaded }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setVideos: (videos) => set({ videos }),
  setLoading: (loading) => set({ loading }),
  setShowShorts: (showShorts) => set({ showShorts }),
  setProgress: (progress) => set({ progress }),
}))
