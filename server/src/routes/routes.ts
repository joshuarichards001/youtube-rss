import { Router } from 'express';
import multer from 'multer';
import { importCsv } from '../controllers/importController.js';
import { syncSubscriptions } from '../controllers/subscriptionController.js';
import { authenticateUser } from '../middleware/auth.js';

const router: Router = Router();
const upload = multer();

router.post('/import-csv', authenticateUser, upload.single('file'), importCsv);
router.post('/subscriptions/sync', authenticateUser, syncSubscriptions);

export default router;
