import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ─── Multer setup for image uploads ───
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // SVG is intentionally disallowed (stored XSS vector)
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    // Also verify declared mime type matches to block double-extension tricks
    const okMime = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    if (allowed.test(path.extname(file.originalname)) && okMime) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPG、PNG、WebP、GIF 格式（不支持 SVG）'));
    }
  },
});

// ─── Auth ───
router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: '请输入密码' });
    }

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
    if (!admin) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken({ username: admin.username, id: admin.id });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// All routes below require auth
router.use(authMiddleware);

// ─── Site Config ───
router.put('/site-config', (req, res) => {
  try {
    const db = getDb();
    const updates = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)');

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string' && key) {
        stmt.run(key, value);
      }
    }

    res.json({ success: true, message: '站点配置已更新' });
  } catch (err) {
    console.error('Update site config error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Concepts CRUD ───
router.get('/concepts', (req, res) => {
  try {
    const db = getDb();
    const concepts = db.prepare('SELECT * FROM concepts ORDER BY sort_order ASC').all();
    res.json(concepts);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/concepts', (req, res) => {
  try {
    const db = getDb();
    const { id, numeral, title, title_en, description, sort_order } = req.body;
    if (!id || !numeral || !title || !title_en || !description) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    db.prepare(
      'INSERT INTO concepts (id, numeral, title, title_en, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, numeral, title, title_en, description, sort_order || 0);

    res.json({ success: true, message: '概念已创建' });
  } catch (err) {
    console.error('Create concept error:', err);
    res.status(500).json({ error: '服务器错误，ID可能已存在' });
  }
});

router.put('/concepts/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { numeral, title, title_en, description, sort_order } = req.body;

    const existing = db.prepare('SELECT * FROM concepts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '概念不存在' });
    }

    db.prepare(
      'UPDATE concepts SET numeral = ?, title = ?, title_en = ?, description = ?, sort_order = ? WHERE id = ?'
    ).run(
      numeral || existing.numeral,
      title || existing.title,
      title_en || existing.title_en,
      description || existing.description,
      sort_order !== undefined ? sort_order : existing.sort_order,
      id
    );

    res.json({ success: true, message: '概念已更新' });
  } catch (err) {
    console.error('Update concept error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/concepts/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.prepare('DELETE FROM concepts WHERE id = ?').run(id);
    res.json({ success: true, message: '概念已删除' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Collection Items CRUD ───
router.get('/collection', (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM collection_items ORDER BY sort_order ASC').all();
    const parsed = items.map((item) => ({
      ...item,
      tags: JSON.parse(item.tags || '[]'),
      cover: {
        id: item.slug,
        url: item.cover_url,
        alt: item.cover_alt,
        width: item.cover_width,
        height: item.cover_height,
      },
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/collection', (req, res) => {
  try {
    const db = getDb();
    const { slug, title, title_en, subtitle, subtitle_en, category, cover_url, cover_alt, year, tags, content, content_en, gallery, video_url, sort_order } = req.body;

    if (!slug || !title || !category || !cover_url) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    db.prepare(
      `INSERT INTO collection_items (slug, title, title_en, subtitle, subtitle_en, category, cover_url, cover_alt, year, tags, content, content_en, gallery, video_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      slug, title, title_en || '', subtitle || '', subtitle_en || '', category,
      cover_url, cover_alt || '', year || new Date().getFullYear(),
      JSON.stringify(tags || []), content || '', content_en || '',
      JSON.stringify(gallery || []), video_url || '', sort_order || 0
    );

    res.json({ success: true, message: '作品已创建' });
  } catch (err) {
    console.error('Create collection item error:', err);
    res.status(500).json({ error: '服务器错误，Slug可能已存在' });
  }
});

router.put('/collection/:slug', (req, res) => {
  try {
    const db = getDb();
    const { slug } = req.params;
    const fields = req.body;

    const existing = db.prepare('SELECT * FROM collection_items WHERE slug = ?').get(slug);
    if (!existing) {
      return res.status(404).json({ error: '作品不存在' });
    }

    const pickStr = (v, fallback) => (v !== undefined ? v : fallback ?? '');
    const title = fields.title ?? existing.title;
    const titleEn = pickStr(fields.title_en, existing.title_en);
    const subtitle = fields.subtitle ?? existing.subtitle;
    const subtitleEn = pickStr(fields.subtitle_en, existing.subtitle_en);
    const category = fields.category ?? existing.category;
    const coverUrl = fields.cover_url ?? existing.cover_url;
    const coverAlt = fields.cover_alt ?? existing.cover_alt;
    const year = fields.year ?? existing.year;
    const tags = fields.tags ? JSON.stringify(fields.tags) : existing.tags;
    const content = fields.content !== undefined ? fields.content : (existing.content || '');
    const contentEn = fields.content_en !== undefined ? fields.content_en : (existing.content_en || '');
    const gallery = fields.gallery !== undefined ? JSON.stringify(fields.gallery) : (existing.gallery || '[]');
    const videoUrl = fields.video_url !== undefined ? fields.video_url : (existing.video_url || '');
    const sortOrder = fields.sort_order !== undefined ? fields.sort_order : existing.sort_order;

    db.prepare(
      `UPDATE collection_items SET title=?, title_en=?, subtitle=?, subtitle_en=?, category=?, cover_url=?, cover_alt=?, year=?, tags=?, content=?, content_en=?, gallery=?, video_url=?, sort_order=? WHERE slug=?`
    ).run(title, titleEn, subtitle, subtitleEn, category, coverUrl, coverAlt, year, tags, content, contentEn, gallery, videoUrl, sortOrder, slug);

    res.json({ success: true, message: '作品已更新' });
  } catch (err) {
    console.error('Update collection item error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/collection/:slug', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM collection_items WHERE slug = ?').run(req.params.slug);
    res.json({ success: true, message: '作品已删除' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Journal Posts CRUD ───
router.get('/journal', (req, res) => {
  try {
    const db = getDb();
    const posts = db.prepare('SELECT * FROM journal_posts ORDER BY sort_order ASC').all();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/journal', (req, res) => {
  try {
    const db = getDb();
    const { slug, title, excerpt, date, category, content, image_url, sort_order } = req.body;

    if (!slug || !title || !excerpt || !date || !category) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    db.prepare(
      'INSERT INTO journal_posts (slug, title, excerpt, date, category, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(slug, title, excerpt, date, category, content || '', image_url || '', sort_order || 0);

    res.json({ success: true, message: '日志已发布' });
  } catch (err) {
    console.error('Create journal post error:', err);
    res.status(500).json({ error: '服务器错误，Slug可能已存在' });
  }
});

router.put('/journal/:slug', (req, res) => {
  try {
    const db = getDb();
    const { slug } = req.params;
    const fields = req.body;

    const existing = db.prepare('SELECT * FROM journal_posts WHERE slug = ?').get(slug);
    if (!existing) {
      return res.status(404).json({ error: '日志不存在' });
    }

    const title = fields.title ?? existing.title;
    const excerpt = fields.excerpt ?? existing.excerpt;
    const date = fields.date ?? existing.date;
    const category = fields.category ?? existing.category;
    const content = fields.content !== undefined ? fields.content : existing.content;
    const image_url = fields.image_url !== undefined ? fields.image_url : existing.image_url;
    const sort_order = fields.sort_order !== undefined ? fields.sort_order : existing.sort_order;

    db.prepare(
      'UPDATE journal_posts SET title=?, excerpt=?, date=?, category=?, content=?, image_url=?, sort_order=? WHERE slug=?'
    ).run(title, excerpt, date, category, content || '', image_url || '', sort_order, slug);

    res.json({ success: true, message: '日志已更新' });
  } catch (err) {
    console.error('Update journal post error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/journal/:slug', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM journal_posts WHERE slug = ?').run(req.params.slug);
    res.json({ success: true, message: '日志已删除' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Image Upload ───
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    const url = '/uploads/' + req.file.filename;
    res.json({ success: true, url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: '上传失败' });
  }
}, (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: '文件太大，最大支持 10MB' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ─── Dashboard stats ───
router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const concepts = db.prepare('SELECT COUNT(*) as count FROM concepts').get();
    const collection = db.prepare('SELECT COUNT(*) as count FROM collection_items').get();
    const journal = db.prepare('SELECT COUNT(*) as count FROM journal_posts').get();
    const contacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get();

    res.json({
      concepts: concepts.count,
      collection: collection.count,
      journal: journal.count,
      contacts: contacts.count,
    });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── About Sections ───
router.get('/about', (req, res) => {
  try {
    const db = getDb();
    const sections = db.prepare('SELECT * FROM about_sections ORDER BY sort_order ASC').all();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/about/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { title, content } = req.body;

    const existing = db.prepare('SELECT * FROM about_sections WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: '章节不存在' });

    db.prepare('UPDATE about_sections SET title = ?, content = ? WHERE id = ?')
      .run(title ?? existing.title, content ?? existing.content, id);

    res.json({ success: true, message: '章节已更新' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Get contacts list ───
router.get('/contacts', (req, res) => {
  try {
    const db = getDb();
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Press / media items CRUD ───
router.get('/press', (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM press_items ORDER BY sort_order ASC, date DESC').all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/press', (req, res) => {
  try {
    const db = getDb();
    const { id, type, title, url, file_url, logo_url, source, date, sort_order } = req.body;
    if (!id || !title) {
      return res.status(400).json({ error: '请填写 ID 与标题' });
    }
    db.prepare(
      "INSERT INTO press_items (id, type, title, url, file_url, logo_url, source, date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, type || 'coverage', title, url || '', file_url || '', logo_url || '', source || '', date || '', sort_order || 0);
    res.json({ success: true, message: '媒体条目已创建' });
  } catch (err) {
    console.error('Create press item error:', err);
    res.status(500).json({ error: '服务器错误，ID可能已存在' });
  }
});

router.put('/press/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM press_items WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '媒体条目不存在' });
    const f = req.body;
    db.prepare(
      'UPDATE press_items SET type=?, title=?, url=?, file_url=?, logo_url=?, source=?, date=?, sort_order=? WHERE id=?'
    ).run(
      f.type ?? existing.type,
      f.title ?? existing.title,
      f.url !== undefined ? f.url : existing.url,
      f.file_url !== undefined ? f.file_url : existing.file_url,
      f.logo_url !== undefined ? f.logo_url : existing.logo_url,
      f.source !== undefined ? f.source : existing.source,
      f.date !== undefined ? f.date : existing.date,
      f.sort_order !== undefined ? f.sort_order : existing.sort_order,
      req.params.id
    );
    res.json({ success: true, message: '媒体条目已更新' });
  } catch (err) {
    console.error('Update press item error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/press/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM press_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '媒体条目已删除' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Subscribers ───
router.get('/subscribers', (req, res) => {
  try {
    const db = getDb();
    const subs = db.prepare('SELECT id, email, confirmed, created_at FROM subscribers ORDER BY created_at DESC').all();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/subscribers/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM subscribers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: '订阅者已删除' });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// CSV export of subscribers
router.get('/subscribers/export.csv', (req, res) => {
  try {
    const db = getDb();
    const subs = db.prepare('SELECT email, confirmed, created_at FROM subscribers ORDER BY created_at ASC').all();
    const csv = 'email,confirmed,created_at\n' + subs.map((s) => `${s.email},${s.confirmed},"${s.created_at}"`).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send('\ufeff' + csv); // BOM so Excel opens UTF-8 correctly
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ─── Analytics — aggregated pageviews ───
router.get('/analytics', (req, res) => {
  try {
    const db = getDb();
    const byDay = db.prepare(
      "SELECT day, COUNT(*) as count FROM pageviews WHERE day >= date('now', '-30 days') GROUP BY day ORDER BY day ASC"
    ).all();
    const topPaths = db.prepare(
      "SELECT path, COUNT(*) as count FROM pageviews WHERE day >= date('now', '-30 days') GROUP BY path ORDER BY count DESC LIMIT 10"
    ).all();
    const topReferrers = db.prepare(
      "SELECT CASE WHEN referrer = '' THEN '(直接访问)' ELSE referrer END as referrer, COUNT(*) as count FROM pageviews WHERE day >= date('now', '-30 days') GROUP BY referrer ORDER BY count DESC LIMIT 10"
    ).all();
    const total = db.prepare('SELECT COUNT(*) as count FROM pageviews').get().count;
    const today = db.prepare("SELECT COUNT(*) as count FROM pageviews WHERE day = date('now')").get().count;
    res.json({
      total,
      today,
      byDay,
      topPaths,
      topReferrers,
      subscribers: db.prepare('SELECT COUNT(*) as count FROM subscribers').get().count,
    });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
