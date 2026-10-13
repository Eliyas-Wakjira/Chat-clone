import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mainRouter from './src/api/main.route.js';
import { testConnection } from './db/db.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// CORS: allow all by default, or restrict to CORS_ORIGIN (comma-separated) when set
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map((o) => o.trim()) } : {}));
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ChatGPT Clone Backend API is running smoothly!',
    timestamp: new Date(),
  });
});

// DB health check route - database waliin walqunnamtii mirkaneessuuf
app.get('/api/health', async (req, res) => {
  const connected = await testConnection();
  res.status(connected ? 200 : 500).json({
    success: connected,
    database: connected ? 'connected' : 'disconnected',
  });
});

// /api + /auth => /api/auth/*
// /api + /chat => /api/chat/*
app.use('/api', mainRouter);

const PORT = process.env.PORT || 3888;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testConnection();
});
