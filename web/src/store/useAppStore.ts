import type { Session } from "@supabase/supabase-js";
import type { Subscription, SubscriptionVideoView } from "../types";
import { create } from "zustand";

interface AppState {
  session: Session | null;
  authLoaded: boolean;
  subscriptions: Subscription[];
  videos: SubscriptionVideoView[];
  loading: boolean;
  syncing: boolean;
  showShorts: boolean;
  progress: {
    status: "idle" | "starting" | "progress" | "completed" | "error";
    processed: number;
    total: number;
    message: string;
  };
  setSession: (session: Session | null) => void;
  setAuthLoaded: (loaded: boolean) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setVideos: (videos: SubscriptionVideoView[]) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setShowShorts: (showShorts: boolean) => void;
  hasMoreVideos: boolean;
  setHasMoreVideos: (hasMore: boolean) => void;
  appendVideos: (videos: SubscriptionVideoView[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setProgress: (progress: AppState["progress"]) => void;
  syncSubscriptions: (() => Promise<void>) | null;
  setSyncSubscriptions: (fn: () => Promise<void>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  authLoaded: false,
  subscriptions: [],
  videos: [],
  loading: false,
  syncing: false,
  showShorts: false,
  hasMoreVideos: true,
  setHasMoreVideos: (hasMoreVideos) => set({ hasMoreVideos }),
  appendVideos: (newVideos) =>
    set((state) => ({ videos: [...state.videos, ...newVideos] })),
  sidebarOpen: false,
  progress: { status: "idle", processed: 0, total: 0, message: "" },
  setSession: (session) => set({ session }),
  setAuthLoaded: (authLoaded) => set({ authLoaded }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setVideos: (videos) => set({ videos }),
  setLoading: (loading) => set({ loading }),
  setSyncing: (syncing) => set({ syncing }),
  setShowShorts: (showShorts) => set({ showShorts }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setProgress: (progress) => set({ progress }),
  syncSubscriptions: null,
  setSyncSubscriptions: (fn) => set({ syncSubscriptions: fn }),
}));
