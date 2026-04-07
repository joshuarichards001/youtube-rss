import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const isShort = (url: string) => url.includes('/shorts/')

export const VideoGrid = () => {
  const videos = useAppStore((state) => state.videos)
  const loading = useAppStore((state) => state.loading)
  const showShorts = useAppStore((state) => state.showShorts)
  const setShowShorts = useAppStore((state) => state.setShowShorts)
  const navigate = useNavigate()

  const filteredVideos = showShorts ? videos : videos.filter((v) => !isShort(v.video_url))

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.video_id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(`/watch/${video.video_id}`)}
          >
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
                {video.video_title}
              </h3>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm w-full">
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredVideos.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 opacity-50">
            No videos found. Subscriptions might still be syncing.
          </div>
        )}
      </div>
    </div>
  )
}
