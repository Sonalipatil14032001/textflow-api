import { Router } from 'express';
import { getSubscription, updatePlan, stripeWebhook } from '../controllers/subscriptionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getSubscription);
router.put('/plan', authenticate, updatePlan);
router.post('/webhook', stripeWebhook);

export default router;