import { Router } from 'express';
import multer from 'multer';
import { importCsv } from '../controllers/importController.js';
import { syncSubscriptions } from '../controllers/subscriptionController.js';
import { authenticateUser } from '../middleware/auth.js';
import { progressTracker } from '../services/progressTracker.js';

const router: Router = Router();
const upload = multer();

router.get('/sse', authenticateUser, (req, res) => {
  const user = (req as any).user;

  // SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  progressTracker.addConnection(user.id, res);
});

router.post('/import-csv', authenticateUser, upload.single('file'), importCsv);
router.post('/subscriptions/sync', authenticateUser, syncSubscriptions);

export default router;
