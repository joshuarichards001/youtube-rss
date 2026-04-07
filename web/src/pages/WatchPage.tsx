import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export const WatchPage = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const video = useAppStore((state) =>
    state.videos.find((v) => v.video_id === videoId)
  )

  if (!video) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg opacity-60">Video not found</p>
        <Link to="/" className="btn btn-primary btn-sm">
          Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="btn btn-ghost btn-sm self-start gap-2">
        ← Back to videos
      </Link>
      <div className="w-full aspect-video">
        <iframe
          className="w-full h-full rounded-xl"
          src={`https://www.youtube.com/embed/${video.video_id}`}
          title={video.video_title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{video.video_title}</h1>
        <Link to={`/channel/${video.channel_id}`} className="badge badge-outline hover:badge-primary transition-colors">
          {video.channel_title || 'Unknown Channel'}
        </Link>
        <p className="text-sm opacity-60">
          Published {new Date(video.published_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
