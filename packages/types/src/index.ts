export type Subscription = {
  id: string
  title: string
  thumbnail: string
  channelId: string
  description: string
}

export type YouTubeSubscription = {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      default: {
        url: string
      }
    }
    resourceId: {
      channelId: string
    }
  }
}

export const mapYouTubeSubscriptionToSubscription = (
  ytSub: YouTubeSubscription
): Subscription => {
  return {
    id: ytSub.id,
    title: ytSub.snippet.title,
    thumbnail: ytSub.snippet.thumbnails.default.url,
    channelId: ytSub.snippet.resourceId.channelId,
    description: ytSub.snippet.description,
  }
}

export type SupabaseUser = {
  id: string
  created_at: string
  username: string
  avatar_url: string
}

export type SupabaseChannel = {
  id: string
  created_at: string
  handle: string
  title: string
  thumbnail_url: string
  last_synced_at: string
}

export type SupabaseSubscription = {
  id: number
  created_at: string
  user_id: string
  channel_id: string
}

export type SupabaseVideo = {
  id: string
  created_at: string
  channel_id: string
  title: string
  description: string | null
  published_at: string
  thumbnail_url: string
  video_url: string
}

export type SubscriptionVideoView = {
  video_id: string
  video_title: string
  published_at: string
  video_thumbnail: string
  video_url: string
  channel_id: string
  channel_title: string
  channel_handle: string
  user_id: string
}
