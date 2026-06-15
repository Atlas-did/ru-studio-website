import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Serve static files (Vite build output)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// API routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// SPA fallback — serve index.html for all non-API routes
app.get('/{*path}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
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
  console.log(`Admin panel at http://localhost:${PORT}/#/admin`);
});
