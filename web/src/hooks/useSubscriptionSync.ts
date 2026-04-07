import { useCallback, useEffect, useRef } from "react";
import { fetchSubscriptions, fetchVideos } from "../helpers/supabaseFunctions";
import { fetchYouTubeSubscriptions } from "../helpers/youtubeAPI";
import { useAppStore } from "../store/useAppStore";

export const useSubscriptionSync = () => {
  const {
    session,
    setSubscriptions,
    setLoading,
    setSyncing,
    setSyncSubscriptions,
    setVideos,
    setProgress,
    setHasMoreVideos,
  } = useAppStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  // Setup SSE Connection
  useEffect(() => {
    if (!session?.access_token) return;

    const setupEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const url = new URL("/api/sse", window.location.origin);
      url.searchParams.append("token", session.access_token);

      const es = new EventSource(url.toString());

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data);

          if (data.status === "completed") {
            fetchVideos().then((vids) => {
              setVideos(vids);
              setHasMoreVideos(vids.length === 50);
            });
            setTimeout(() => {
              setProgress({
                status: "idle",
                processed: 0,
                total: 0,
                message: "",
              });
            }, 5000);
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      };

      es.onerror = (err) => {
        console.error("SSE Error:", err);
        es.close();
      };

      eventSourceRef.current = es;
    };

    setupEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [session, setProgress, setVideos]);

  // Load subscriptions from Supabase on session ready
  useEffect(() => {
    if (!session?.access_token) return;

    setLoading(true);
    Promise.all([fetchSubscriptions(), fetchVideos()])
      .then(([subs, vids]) => {
        setSubscriptions(subs);
        setVideos(vids);
        setHasMoreVideos(vids.length === 50);
      })
      .finally(() => setLoading(false));
  }, [
    session?.access_token,
    setSubscriptions,
    setLoading,
    setVideos,
    setHasMoreVideos,
  ]);

  // Explicit sync triggered by user
  const syncSubscriptions = useCallback(async () => {
    const providerToken = session?.provider_token;
    if (!providerToken || !session?.access_token) return;

    setSyncing(true);
    try {
      const subs = await fetchYouTubeSubscriptions(
        providerToken,
        session.access_token,
      );
      setSubscriptions(subs);
      const vids = await fetchVideos();
      setVideos(vids);
      setHasMoreVideos(vids.length === 50);
    } finally {
      setSyncing(false);
    }
  }, [session, setSubscriptions, setSyncing, setVideos, setHasMoreVideos]);

  // Register sync function on the store so other components can call it
  useEffect(() => {
    setSyncSubscriptions(syncSubscriptions);
  }, [syncSubscriptions, setSyncSubscriptions]);
};
