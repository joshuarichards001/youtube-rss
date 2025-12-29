import type { Subscription } from '@youtube-rss/types';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '../config/supabase.js';

const BATCH_SIZE = 4;
const DELAY_MS = 5000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

const fetchRssFeed = async (channelId: string) => {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xml = await response.text();
    console.log(`[RSS Worker] Fetched RSS for ${channelId} (${xml.length} bytes)`);

    const result = parser.parse(xml);
    const entries = result.feed?.entry;

    if (!entries) {
      console.log(`[RSS Worker] No entries found for ${channelId}`);
      return;
    }

    // specific handling for single entry vs array
    const entriesArray = Array.isArray(entries) ? entries : [entries];

    const videosToUpsert = entriesArray.map((entry: any) => {
      const videoId = entry['yt:videoId'];
      const mediaGroup = entry['media:group'];
      const thumbnail = mediaGroup?.['media:thumbnail']?.['@_url'] || '';
      const description = mediaGroup?.['media:description'] || '';

      return {
        id: videoId,
        channel_id: channelId,
        title: entry.title,
        description: description.substring(0, 5000), // Truncate if necessary, though text is usually fine
        published_at: entry.published,
        thumbnail_url: thumbnail,
        video_url: entry.link?.['@_href'] || `https://www.youtube.com/watch?v=${videoId}`,
      };
    });

    if (videosToUpsert.length > 0) {
      const { error } = await supabase
        .from('videos')
        .upsert(videosToUpsert, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.error(`[RSS Worker] Error upserting videos for ${channelId}:`, error);
      } else {
        console.log(`[RSS Worker] Synced ${videosToUpsert.length} videos for ${channelId}`);
      }
    }
  } catch (error) {
    console.error(`[RSS Worker] Failed to fetch RSS for ${channelId}:`, error);
  }
};

export const processSubscriptions = async (subscriptions: Subscription[]) => {
  console.log(`[RSS Worker] Starting to process ${subscriptions.length} subscriptions...`);

  for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
    const batch = subscriptions.slice(i, i + BATCH_SIZE);

    console.log(`[RSS Worker] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} channels)`);

    // Process batch in parallel
    await Promise.all(batch.map(sub => fetchRssFeed(sub.channelId)));

    // Wait before next batch if there are more items
    if (i + BATCH_SIZE < subscriptions.length) {
      console.log(`[RSS Worker] Waiting ${DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('[RSS Worker] Finished processing all subscriptions.');
};
