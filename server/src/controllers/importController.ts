import csvParser from 'csv-parser';
import type { Response } from 'express';
import { Readable } from 'stream';
import { supabase } from '../config/supabase.js';
import type { AuthRequest } from '../middleware/auth.js';

interface ChannelData {
  id: string;
  title: string;
}

export const importCsv = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const channels: ChannelData[] = [];
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csvParser(['title', 'id']))
    .on('data', (data) => channels.push(data))
    .on('end', async () => {
      try {
        console.log(`Processing ${channels.length} channels for user ${req.user.id}`);

        const channelUpserts = channels.map(c => ({
          id: c.id,
          title: c.title,
          last_synced_at: new Date(0).toISOString()
        }));

        const { error: chanError } = await supabase
          .from('channels')
          .upsert(channelUpserts, { onConflict: 'id' });

        if (chanError) throw chanError;

        const subscriptionInserts = channels.map(c => ({
          user_id: req.user.id,
          channel_id: c.id,
        }));

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionInserts, { onConflict: 'user_id,channel_id' });

        if (subError) throw subError;

        res.status(200).json({
          message: 'Import started successfully',
          count: channels.length
        });

      } catch (err: any) {
        console.error('Import error:', err);
        res.status(500).json({ error: 'Failed to process channels' });
      }
    });
};
