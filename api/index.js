import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { runtime } from './runtime.js';
import { ensureAdminUser } from './utils/ensureAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO || process.env.MONGODB_URI;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri) {
  console.error('❌ Missing MongoDB connection string. Set MONGO or MONGODB_URI in .env');
  process.exit(1);
}

if (!jwtSecret) {
  console.error('❌ Missing JWT_SECRET in .env');
  process.exit(1);
}

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AuraKey',
    database: runtime.dbMode,
    startedAt: runtime.startedAt,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    statusCode: 404,
  });
});

const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

function mongoTarget(uri) {
  try {
    return new URL(uri.replace(/^mongodb\+srv/, 'https')).host;
  } catch {
    return 'MongoDB';
  }
}

async function connectDatabase() {
  const usingAtlas = mongoUri.startsWith('mongodb+srv://');
  const connectOptions = {
    serverSelectionTimeoutMS: 20000,
  };

  if (mongoUser && mongoPassword) {
    connectOptions.user = mongoUser;
    connectOptions.pass = mongoPassword;
    connectOptions.authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  }

  try {
    await mongoose.connect(mongoUri, connectOptions);
    runtime.dbMode = usingAtlas ? 'atlas' : 'mongodb';
    console.log(`✅ Connected to MongoDB (${mongoTarget(mongoUri)})`);
    return;
  } catch (err) {
    if (usingAtlas) {
      console.error(`❌ Could not connect to MongoDB Atlas (${mongoTarget(mongoUri)}): ${err.message}`);
      console.error('   Check the database username/password, and allow this IP under Atlas Network Access.');
    } else {
      console.warn(`⚠️  Could not connect to ${mongoTarget(mongoUri)}: ${err.message}`);
    }

    console.warn('   Starting an in-memory MongoDB so you can still sign up and sign in locally...');

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri('authbp');
    await mongoose.connect(memoryUri);
    runtime.dbMode = 'memory';
    console.log('✅ Connected to in-memory MongoDB (data resets when the server stops)');
  }
}

connectDatabase()
  .then(async () => {
    await ensureAdminUser();
    app.listen(3000, () => {
      console.log('🚀 Server listening on port 3000');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
