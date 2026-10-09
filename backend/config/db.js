import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the URI specified in environment variables
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_planner';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if MongoDB instance is unreachable
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB (${error.message})`);
    console.warn('[Database] The server will continue running. Ensure MongoDB is active when running database queries.');
  }
};

export default connectDB;
