import { Router } from 'express';
import { trackUsage, getUsage } from '../controllers/usageController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/track', authenticate, trackUsage);
router.get('/stats', authenticate, getUsage);

export default router;