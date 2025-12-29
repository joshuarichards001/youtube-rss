import {
  mapYouTubeSubscriptionToSubscription,
  type Subscription,
  type YouTubeSubscription,
} from '@youtube-rss/types'

export const fetchYouTubeSubscriptions = async (token: string): Promise<Subscription[]> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const data = await response.json()
    const items: YouTubeSubscription[] = data.items || []
    return items.map(mapYouTubeSubscriptionToSubscription)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return []
  }
}
