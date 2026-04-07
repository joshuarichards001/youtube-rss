import { supabase } from "../config/supabase.js";
import { fetchRssFeed } from "../services/rssWorker.js";

const BATCH_SIZE = 10;
const DELAY_MS = 2500;

async function refreshAllFeeds() {
  console.log("[Cron] Starting daily feed refresh...");

  const { data: channels, error } = await supabase
    .from("channels")
    .select("id");

  if (error || !channels) {
    console.error("[Cron] Failed to fetch channels:", error);
    process.exit(1);
  }

  console.log(`[Cron] Found ${channels.length} channels to refresh`);

  let processed = 0;

  for (let i = 0; i < channels.length; i += BATCH_SIZE) {
    const batch = channels.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map((ch) => fetchRssFeed(ch.id)));

    processed += batch.length;
    console.log(`[Cron] Processed ${processed}/${channels.length} channels`);

    if (i + BATCH_SIZE < channels.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log("[Cron] Feed refresh complete.");
}

refreshAllFeeds().catch((err) => {
  console.error("[Cron] Fatal error:", err);
  process.exit(1);
});
