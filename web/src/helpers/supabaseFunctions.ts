import type { SubscriptionVideoView } from "@youtube-rss/types";
import { supabase } from "./supabaseClient";

export const fetchVideos = async (): Promise<SubscriptionVideoView[]> => {
  try {
    const { data: vids, error: vidError } = await supabase
      .from('subscription_videos')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20)

    if (vidError) throw vidError

    return vids || [];
  } catch (error) {
    console.error('Error fetching videos:', error)
    return [];
  }
}