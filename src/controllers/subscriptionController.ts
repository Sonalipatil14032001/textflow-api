import { Request, Response } from 'express';
import pool from '../config/db';

const PLANS = {
  free: { chars_limit: 10000, price: 0 },
  pro: { chars_limit: 500000, price: 9.99 },
  enterprise: { chars_limit: 99999999, price: 49.99 }
};

// Get current subscription
export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json({ subscription: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upgrade or downgrade plan
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { plan } = req.body;

    if (!PLANS[plan as keyof typeof PLANS]) {
      res.status(400).json({ error: 'Invalid plan. Choose free, pro, or enterprise' });
      return;
    }

    const { chars_limit } = PLANS[plan as keyof typeof PLANS];

    const result = await pool.query(
      `UPDATE subscriptions 
       SET plan = $1, chars_limit = $2, updated_at = NOW()
       WHERE user_id = $3
       RETURNING *`,
      [plan, chars_limit, userId]
    );

    res.json({
      message: `Plan updated to ${plan}`,
      subscription: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mock Stripe webhook
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, userId, plan } = req.body;

    if (type === 'payment_succeeded') {
      const { chars_limit } = PLANS[plan as keyof typeof PLANS] || PLANS.free;

      await pool.query(
        `UPDATE subscriptions 
         SET plan = $1, status = 'active', chars_limit = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [plan, chars_limit, userId]
      );

      res.json({ message: `Payment succeeded. Plan upgraded to ${plan}` });

    } else if (type === 'payment_failed') {
      await pool.query(
        `UPDATE subscriptions 
         SET status = 'past_due', updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      res.json({ message: 'Payment failed. Subscription marked as past_due' });

    } else if (type === 'subscription_cancelled') {
      await pool.query(
        `UPDATE subscriptions 
         SET plan = 'free', status = 'cancelled', chars_limit = 10000, updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      res.json({ message: 'Subscription cancelled. Downgraded to free plan' });

    } else {
      res.status(400).json({ error: 'Unknown webhook event type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};