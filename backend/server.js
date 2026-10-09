import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import sipRoutes from './routes/sipRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { seedInitialDatabase } from './services/dataSeeder.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration to allow React frontend communication
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.send('Investment Planner Backend API is online.');
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/sips', sipRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Express server immediately and connect to MongoDB
app.listen(PORT, () => {
  console.log(`[Server] Investment Planner Backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});

// Connect to MongoDB and seed initial database
connectDB().then(() => {
  seedInitialDatabase();
});
