export type Subscription = {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  description: string;
};

export type SubscriptionVideoView = {
  video_id: string;
  video_title: string;
  published_at: string;
  video_thumbnail: string;
  video_url: string;
  channel_id: string;
  channel_title: string;
  channel_handle: string;
  user_id: string;
};
