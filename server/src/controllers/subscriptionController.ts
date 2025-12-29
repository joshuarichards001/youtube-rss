import { mapYouTubeSubscriptionToSubscription, type Subscription, type YouTubeSubscription } from '@youtube-rss/types';
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { processSubscriptions } from '../services/rssWorker.js';

interface AuthRequest extends Request {
  user?: any;
}

export const syncSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { providerToken } = req.body;
  const user = req.user;

  console.log(`[Sync] Starting subscription sync for user ${user?.id}`);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!providerToken) {
    res.status(400).json({ error: 'Missing provider token' });
    return;
  }

  try {
    let allItems: YouTubeSubscription[] = [];
    let nextPageToken: string | undefined = undefined;

    // 1. Fetch all subscriptions from YouTube API
    console.log('[Sync] Fetching YouTube subscriptions...');
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('mine', 'true');
      url.searchParams.append('maxResults', '50');
      if (nextPageToken) {
        url.searchParams.append('pageToken', nextPageToken);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API Error:', errorText);
        res.status(response.status).json({ error: 'Failed to fetch subscriptions from YouTube' });
        return;
      }

      const data = await response.json();
      const items: YouTubeSubscription[] = data.items || [];
      allItems = [...allItems, ...items];
      console.log(`[Sync] Fetched page. Total so far: ${allItems.length}`);
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    console.log(`[Sync] Total subscriptions fetched from YouTube: ${allItems.length}`);
    const subscriptions: Subscription[] = allItems.map(mapYouTubeSubscriptionToSubscription);

    // 2. Fetch existing channels from Supabase to check last_synced_at
    const channelIds = subscriptions.map((sub) => sub.channelId);

    // Handle case with no subscriptions
    if (channelIds.length === 0) {
      console.log('[Sync] No subscriptions found.');
      res.json([]);
      return;
    }

    const { data: existingChannels, error: existingChannelsError } = await supabase
      .from('channels')
      .select('id, last_synced_at')
      .in('id', channelIds);

    if (existingChannelsError) {
      console.error('Error fetching existing channels:', existingChannelsError);
      throw new Error('Failed to check existing channels');
    }

    const existingChannelsMap = new Map(
      existingChannels?.map((ch) => [ch.id, ch]) || []
    );

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const channelsToUpsert: any[] = [];
    const subscriptionsToRssSync: Subscription[] = [];

    subscriptions.forEach((sub) => {
      const existing = existingChannelsMap.get(sub.channelId);
      let shouldSyncRss = false;
      let lastSyncedAt = now.toISOString();

      if (!existing) {
        // New channel, sync it
        shouldSyncRss = true;
      } else {
        const lastSyncedDate = new Date(existing.last_synced_at);
        if (lastSyncedDate < startOfToday) {
          // Synced before today, sync again
          shouldSyncRss = true;
        } else {
          // Synced today, skip RSS
          shouldSyncRss = false;
          lastSyncedAt = existing.last_synced_at; // Keep existing timestamp
        }
      }

      if (shouldSyncRss) {
        subscriptionsToRssSync.push(sub);
      }

      channelsToUpsert.push({
        id: sub.channelId,
        title: sub.title,
        handle: sub.channelId,
        thumbnail_url: sub.thumbnail,
        last_synced_at: lastSyncedAt,
      });
    });

    // 3. Upsert Channels
    console.log(`[Sync] Preparing to upsert ${channelsToUpsert.length} channels`);
    // Note: channelsToUpsert is already constructed above

    if (channelsToUpsert.length > 0) {
      const { error: channelsError } = await supabase
        .from('channels')
        .upsert(channelsToUpsert, { onConflict: 'id', ignoreDuplicates: false });

      if (channelsError) {
        console.error('Error upserting channels:', channelsError);
        throw new Error('Failed to sync channels');
      }
      console.log(`[Sync] Upserted ${channelsToUpsert.length} channels`);
    }

    // 4. Sync Subscriptions (Delete missing, Insert new)
    // First, get all existing subscriptions for this user
    const { data: existingSubs, error: fetchError } = await supabase
      .from('subscriptions')
      .select('channel_id')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching existing subscriptions:', fetchError);
      throw new Error('Failed to fetch existing subscriptions');
    }

    console.log(`[Sync] Found ${existingSubs?.length || 0} existing subscriptions`);

    const existingChannelIds = new Set(existingSubs?.map((s) => s.channel_id) || []);
    const newChannelIds = new Set(subscriptions.map((s) => s.channelId));

    // Determine what to add and remove
    const toAdd = subscriptions.filter((s) => !existingChannelIds.has(s.channelId));
    const toRemove = [...existingChannelIds].filter((id) => !newChannelIds.has(id));

    console.log(`[Sync] Calculations: ${toAdd.length} to add, ${toRemove.length} to remove`);

    // Remove old subscriptions
    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id)
        .in('channel_id', toRemove);

      if (removeError) {
        console.error('Error removing old subscriptions:', removeError);
      } else {
        console.log(`[Sync] Removed ${toRemove.length} old subscriptions`);
      }
    }

    // Add new subscriptions
    if (toAdd.length > 0) {
      const subsToInsert = toAdd.map((sub) => ({
        user_id: user.id,
        channel_id: sub.channelId,
      }));

      const { error: insertError } = await supabase
        .from('subscriptions')
        .upsert(subsToInsert, { onConflict: 'user_id, channel_id', ignoreDuplicates: true });

      if (insertError) {
        console.error('Error inserting subscriptions:', insertError);
        throw new Error('Failed to insert subscriptions');
      }
      console.log(`[Sync] Added ${toAdd.length} new subscriptions`);
    }

    console.log(`[Sync] Database sync complete. Queuing ${subscriptionsToRssSync.length} channels for RSS fetch...`);

    // Fire-and-forget the worker
    if (subscriptionsToRssSync.length > 0) {
      processSubscriptions(subscriptionsToRssSync).catch((err: unknown) => {
        console.error('Error in RSS worker:', err);
      });
    } else {
      console.log('[Sync] No channels need RSS sync (all synced today).');
    }

    console.log('[Sync] Sync request completed successfully');
    res.json(subscriptions);
  } catch (error: unknown) {
    console.error('Error syncing subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
