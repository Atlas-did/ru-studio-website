import express from 'express';
import path from 'path';
import fs from 'fs';
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

// Basic rate limiting — scoped to API only so static assets never consume quota
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

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

// ─── SEO: robots.txt & dynamic sitemap.xml ───
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || process.env.SITE_URL || '';

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api',
      '',
      `Sitemap: ${PUBLIC_BASE_URL}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const db = getDb();
    const base = PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const items = db.prepare('SELECT slug FROM collection_items').all();
    const posts = db.prepare('SELECT slug FROM journal_posts').all();

    const urls = [
      { loc: '/', priority: '1.0' },
      { loc: '/collection', priority: '0.9' },
      { loc: '/journal', priority: '0.8' },
      { loc: '/press', priority: '0.8' },
      { loc: '/about', priority: '0.7' },
      { loc: '/cooperation', priority: '0.7' },
      ...items.map((i) => ({ loc: `/collection/${i.slug}`, priority: '0.8' })),
      ...posts.map((p) => ({ loc: `/journal/${p.slug}`, priority: '0.6' })),
    ];

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls
        .map(
          (u) =>
            `  <url><loc>${base}${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
        )
        .join('\n') +
      '\n</urlset>';

    res.type('application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).end();
  }
});

// SPA fallback — serve index.html for all non-API routes,
// with per-route SEO tags injected server-side (crawler-friendly without puppeteer)
let cachedIndexHtml = null;

function escapeHtml(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHeadTags({ title, description, image, jsonLd }) {
  const base = PUBLIC_BASE_URL || '';
  let tags = `<title>${escapeHtml(title)}</title>`;
  if (description) tags += `\n    <meta name="description" content="${escapeHtml(description)}" />`;
  if (image) {
    const abs = image.startsWith('http') ? image : base + image;
    tags += `\n    <meta property="og:image" content="${escapeHtml(abs)}" />`;
  }
  if (jsonLd) {
    tags += `\n    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  }
  return tags;
}

app.get('/{*path}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // 带文件扩展名的请求（如 /assets/*.js、/favicon.ico）不应回退到 index.html，
  // 否则旧缓存的 chunk 请求会拿到 HTML 导致动态 import 失败。
  if (/\.[a-z0-9]+$/i.test(req.path) || req.path.startsWith('/assets/')) {
    return res.status(404).type('text').send('Not found');
  }

  try {
    if (!cachedIndexHtml) {
      cachedIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    }

    const db = getDb();
    let seo = null;
    let m;

    if ((m = req.path.match(/^\/collection\/([\w-]+)$/))) {
      const item = db.prepare('SELECT * FROM collection_items WHERE slug = ?').get(m[1]);
      if (item) {
        seo = {
          title: `${item.title} ${item.subtitle || ''} — 儒意 RU STUDIO`,
          description: item.cover_alt || item.title,
          image: item.cover_url,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'CreativeWork',
            name: item.title, genre: item.category, dateCreated: String(item.year),
            creator: { '@type': 'Organization', name: '儒意 RU STUDIO' },
          },
        };
      }
    } else if ((m = req.path.match(/^\/journal\/([\w-]+)$/))) {
      const post = db.prepare('SELECT * FROM journal_posts WHERE slug = ?').get(m[1]);
      if (post) {
        seo = {
          title: `${post.title} — 儒意 RU STUDIO`,
          description: post.excerpt,
          image: post.image_url || undefined,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'Article',
            headline: post.title, datePublished: post.date, articleSection: post.category,
            author: { '@type': 'Organization', name: '儒意 RU STUDIO' },
          },
        };
      }
    } else if (req.path === '/collection') {
      seo = { title: '作品收藏 — 儒意 RU STUDIO', description: '儒意作品集：以影像、摄影与装置转译儒家美学的当代器物。' };
    } else if (req.path === '/journal') {
      seo = { title: '品牌日志 — 儒意 RU STUDIO', description: '儒意动态：展览回顾、新品发布、学术合作与品牌荣誉。' };
    } else if (req.path === '/press') {
      seo = { title: '媒体中心 — 儒意 RU STUDIO', description: '品牌资料包、新闻稿与媒体报道。' };
    } else if (req.path === '/about') {
      seo = { title: '关于我们 — 儒意 RU STUDIO', description: '扎根曲阜的儒家文化创意工作室。' };
    } else if (req.path === '/cooperation') {
      seo = { title: '合作洽谈 — 儒意 RU STUDIO', description: '高校文创定制、品牌联名与文化空间策划。' };
    }

    if (seo && cachedIndexHtml.includes('<title>')) {
      const injected = buildHeadTags(seo);
      const html = cachedIndexHtml.replace(/<title>[\s\S]*?<\/title>/, injected);
      return res.status(200).type('html').send(html);
    }

    // Note: res.sendFile 在当前 send@1.2.1 版本下对深层路由异常返回 404，
    // 因此统一走 readFileSync + send 模式（与上方 SEO 分支一致）。
    res.status(200).type('html').send(cachedIndexHtml);
  } catch (err) {
    console.error('SPA fallback error:', err);
    res.status(200).type('html').send(cachedIndexHtml);
  }
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
