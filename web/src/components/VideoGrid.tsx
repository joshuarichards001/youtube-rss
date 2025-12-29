import { useAppStore } from '../store/useAppStore'

export const VideoGrid = () => {
  const videos = useAppStore((state) => state.videos)
  const loading = useAppStore((state) => state.loading)

  return (
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
  )
}
