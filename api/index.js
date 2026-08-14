import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

const mongoUri = process.env.MONGO || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ Missing MongoDB connection string. Set MONGO or MONGODB_URI in api/.env');
}

const __dirname = path.resolve();
const app = express();

// Connect to MongoDB
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(3000, () => {
      console.log('🚀 Server listening on port 3000');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Catch-all for frontend routes (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

