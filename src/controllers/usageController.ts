import { Request, Response } from 'express';
import pool from '../config/db';

// Track character usage
export const trackUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const charsToAdd = text.length;

    // Get current subscription
    const subResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (subResult.rows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    const subscription = subResult.rows[0];

    // Check if user has enough characters left
    if (subscription.chars_used + charsToAdd > subscription.chars_limit) {
      res.status(403).json({
        error: 'Character limit exceeded',
        chars_used: subscription.chars_used,
        chars_limit: subscription.chars_limit,
        chars_remaining: subscription.chars_limit - subscription.chars_used,
        upgrade_message: 'Please upgrade your plan to continue'
      });
      return;
    }

    // Update usage
    const updated = await pool.query(
      `UPDATE subscriptions 
       SET chars_used = chars_used + $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING *`,
      [charsToAdd, userId]
    );

    res.json({
      message: 'Usage tracked successfully',
      chars_added: charsToAdd,
      chars_used: updated.rows[0].chars_used,
      chars_limit: updated.rows[0].chars_limit,
      chars_remaining: updated.rows[0].chars_limit - updated.rows[0].chars_used
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get usage stats
export const getUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const result = await pool.query(
      `SELECT plan, status, chars_used, chars_limit,
              chars_limit - chars_used AS chars_remaining,
              ROUND((chars_used::numeric / chars_limit::numeric) * 100, 2) AS usage_percentage
       FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No usage data found' });
      return;
    }

    res.json({ usage: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};