import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware: security, logging, parsing
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(compression());

// CORS: prefer explicit SITE_URL in production
const corsOptions = process.env.NODE_ENV === 'production' && process.env.SITE_URL
  ? { origin: process.env.SITE_URL }
  : {}; // permissive in non-production
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting for admin/api endpoints
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Serve static files (Vite build output)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// API routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// SPA fallback for BrowserRouter — serve index.html for all non-API, non-file routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') return next();
  // If request looks like a static file (has extension), 404
  if (path.extname(req.path)) return res.status(404).json({ error: 'Not found' });
  // SPA: serve index.html
  res.sendFile(path.join(distDir, 'index.html'));
});

// Initialize database on startup
try {
  getDb();
  console.log('Database initialized successfully');
} catch (err) {
  console.error('Database initialization failed:', err);
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin`);
});
