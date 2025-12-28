import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

// Initialize Supabase Admin (needed to bypass RLS for background imports if necessary)
// or use the regular client if you want to strictly respect RLS.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role to handle batch imports
);

app.use(express.json());

/**
 * Middleware: Supabase Auth Validator
 * Validates the JWT from the frontend and attaches the user to the request.
 */
const authenticateUser = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = user;
  next();
};

/**
 * POST /api/import-csv
 * Expects a multipart form-data upload with a file field named "file"
 */
app.post('/api/import-csv', authenticateUser, upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const channels: { id: string; title: string }[] = [];

  // 1. Parse CSV Stream
  const stream = Readable.from(req.file.buffer);
  
  stream
    .pipe(csvParser(['title', 'id'])) // Maps first col to title, second to id
    .on('data', (data) => channels.push(data))
    .on('end', async () => {
      try {
        console.log(`Processing ${channels.length} channels for user ${req.user.id}`);

        // 2. Upsert Channels (Shared across all users)
        // We do this first to ensure the Foreign Key exists.
        const channelUpserts = channels.map(c => ({
          id: c.id,
          title: c.title,
          last_synced_at: new Date(0).toISOString() // Set to epoch so worker picks it up immediately
        }));

        const { error: chanError } = await supabase
          .from('channels')
          .upsert(channelUpserts, { onConflict: 'id' });

        if (chanError) throw chanError;

        // 3. Create Subscriptions for the specific user
        const subscriptionInserts = channels.map(c => ({
          user_id: req.user.id,
          channel_id: c.id,
        }));

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionInserts, { onConflict: 'user_id,channel_id' });

        if (subError) throw subError;

        // 4. Return success
        // In a real app, you'd trigger a background worker here to start fetching RSS
        res.status(200).json({ 
          message: 'Import started successfully', 
          count: channels.length 
        });

      } catch (err: any) {
        console.error('Import error:', err);
        res.status(500).json({ error: 'Failed to process channels' });
      }
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});