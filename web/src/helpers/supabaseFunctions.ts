import type { SubscriptionVideoView } from "../types";
import { supabase } from "./supabaseClient";

export const fetchVideosByChannel = async (
  channelId: string,
): Promise<SubscriptionVideoView[]> => {
  try {
    const { data: vids, error: vidError } = await supabase
      .from("subscription_videos")
      .select("*")
      .eq("channel_id", channelId)
      .order("published_at", { ascending: false });

    if (vidError) throw vidError;

    return vids || [];
  } catch (error) {
    console.error("Error fetching videos by channel:", error);
    return [];
  }
};

export const fetchVideos = async (
  offset = 0,
  limit = 50,
): Promise<SubscriptionVideoView[]> => {
  try {
    const { data: vids, error: vidError } = await supabase
      .from("subscription_videos")
      .select("*")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (vidError) throw vidError;

    return vids || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};
