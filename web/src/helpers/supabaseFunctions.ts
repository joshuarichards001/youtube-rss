import type { Subscription, SubscriptionVideoView } from "../types";
import { supabase } from "./supabaseClient";

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("channel_id, channels(id, title, thumbnail_url)")
      .order("channel_id");

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.channel_id,
      title: row.channels.title,
      thumbnail: row.channels.thumbnail_url,
      channelId: row.channels.id,
      description: "",
    }));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
};

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
