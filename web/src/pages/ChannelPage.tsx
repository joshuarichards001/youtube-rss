import type { SubscriptionVideoView } from "@youtube-rss/types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchVideosByChannel } from "../helpers/supabaseFunctions";
import { useAppStore } from "../store/useAppStore";

const isShort = (url: string) => url.includes("/shorts/");

export const ChannelPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const subscriptions = useAppStore((state) => state.subscriptions);
  const showShorts = useAppStore((state) => state.showShorts);
  const setShowShorts = useAppStore((state) => state.setShowShorts);
  const [videos, setVideos] = useState<SubscriptionVideoView[]>([]);
  const [loadedChannelId, setLoadedChannelId] = useState<string | null>(null);

  const channel = subscriptions.find((s) => s.channelId === channelId);
  const loading = loadedChannelId !== channelId;

  useEffect(() => {
    if (!channelId) return;

    fetchVideosByChannel(channelId).then((vids) => {
      setVideos(vids);
      setLoadedChannelId(channelId);
    });
  }, [channelId]);

  const filteredVideos = showShorts
    ? videos
    : videos.filter((v) => !isShort(v.video_url));

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="btn btn-ghost btn-sm self-start gap-2 text-base-content/60"
      >
        ← Back to videos
      </Link>

      <div className="flex items-center gap-4">
        {channel?.thumbnail && (
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="rounded-full w-12 h-12"
          />
        )}
        <h1 className="text-2xl font-bold">{channel?.title ?? "Channel"}</h1>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-base-content/70">Videos</h2>
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

      {loading ? (
        <div className="text-center py-10 opacity-50">Loading videos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <Link
              key={video.video_id}
              to={`/watch/${video.video_id}`}
              className="card bg-base-200 hover:bg-base-100 transition-colors duration-200 rounded-xl overflow-hidden"
            >
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
              <div className="p-3">
                <h3
                  className="font-medium text-sm leading-snug line-clamp-2"
                  title={video.video_title}
                >
                  {video.video_title}
                </h3>
              </div>
            </Link>
          ))}
          {filteredVideos.length === 0 && (
            <div className="col-span-full text-center py-10 opacity-50">
              No videos found for this channel.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
