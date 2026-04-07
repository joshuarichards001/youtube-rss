import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVideos } from "../helpers/supabaseFunctions";
import { useAppStore } from "../store/useAppStore";

const isShort = (url: string) => url.includes("/shorts/");

export const VideoGrid = () => {
  const videos = useAppStore((state) => state.videos);
  const loading = useAppStore((state) => state.loading);
  const showShorts = useAppStore((state) => state.showShorts);
  const setShowShorts = useAppStore((state) => state.setShowShorts);
  const hasMoreVideos = useAppStore((state) => state.hasMoreVideos);
  const appendVideos = useAppStore((state) => state.appendVideos);
  const setHasMoreVideos = useAppStore((state) => state.setHasMoreVideos);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreVideos) return;
    setLoadingMore(true);
    const newVideos = await fetchVideos(videos.length);
    if (newVideos.length < 50) setHasMoreVideos(false);
    appendVideos(newVideos);
    setLoadingMore(false);
  }, [
    loadingMore,
    hasMoreVideos,
    videos.length,
    appendVideos,
    setHasMoreVideos,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const filteredVideos = showShorts
    ? videos
    : videos.filter((v) => !isShort(v.video_url));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Recent Videos</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm">Show Shorts</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={showShorts}
            onChange={(e) => setShowShorts(e.target.checked)}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.video_id}
            className="card bg-base-200 hover:bg-base-100 transition-colors duration-200 rounded-xl overflow-hidden"
          >
            <Link to={`/watch/${video.video_id}`}>
              <figure className="relative aspect-video">
                <img
                  src={video.video_thumbnail}
                  alt={video.video_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                  {new Date(video.published_at).toLocaleDateString()}
                </div>
              </figure>
            </Link>
            <div className="p-3 flex flex-col gap-1.5">
              <Link
                to={`/watch/${video.video_id}`}
                className="font-medium text-sm leading-snug line-clamp-2 hover:text-primary transition-colors"
                title={video.video_title}
              >
                {video.video_title}
              </Link>
              <Link
                to={`/channel/${video.channel_id}`}
                className="text-xs text-base-content/50 hover:text-primary transition-colors"
              >
                {video.channel_title || "Unknown Channel"}
              </Link>
            </div>
          </div>
        ))}
        {filteredVideos.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 opacity-50">
            No videos found. Subscriptions might still be syncing.
          </div>
        )}
      </div>
      {hasMoreVideos && <div ref={sentinelRef} className="h-1" />}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}
    </div>
  );
};
