import type { Subscription } from '@youtube-rss/types'

export const fetchYouTubeSubscriptions = async (
  providerToken: string,
  userToken: string
): Promise<Subscription[]> => {
  try {
    const response = await fetch('/api/subscriptions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ providerToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync subscriptions')
    }

    const subscriptions: Subscription[] = await response.json()
    return subscriptions
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return []
  }
}
