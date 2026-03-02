import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
import subscriptionRoutes from './routes/subscriptionRoutes';
import usageRoutes from './routes/usageRoutes';

app.use('/auth', authRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/usage', usageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TextFlow API running' });
});

// Start
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();