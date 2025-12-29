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
