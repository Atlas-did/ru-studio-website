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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/models
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = /\.(jpg|jpeg|png|webp|gif|svg|mp4|webm|mov|glb|gltf|bin)$/i;
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片、视频、3D模型格式 (JPG/PNG/WebP/GIF/SVG/MP4/WebM/MOV/GLB/GLTF)'));
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

// ─── GitHub OAuth Login ───
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Atlas-did/ru-studio-website';

router.get('/github/login', (req, res) => {
  if (!GITHUB_CLIENT_ID) return res.status(400).json({ error: 'GitHub OAuth not configured' });
  const redirect = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user`;
  res.redirect(redirect);
});

router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(401).json({ error: 'GitHub auth failed' });

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'User-Agent': 'RU-Studio' },
    });
    const user = await userRes.json();

    // Check if user is the repo owner or a collaborator
    const repoOwner = GITHUB_REPO.split('/')[0];
    const isOwner = user.login === repoOwner;

    if (!isOwner) {
      const collabRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/collaborators/${user.login}`, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'User-Agent': 'RU-Studio' },
      });
      if (collabRes.status !== 204) {
        return res.status(403).json({ error: '你不是该仓库的协作者，无权登录。' });
      }
    }

    // Create JWT
    const db = getDb();
    // Auto-create admin user if not exists
    const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(user.login);
    if (!existing) {
      const bcrypt = await import('bcryptjs');
      db.prepare('INSERT OR REPLACE INTO admins (username, password_hash) VALUES (?, ?)')
        .run(user.login, bcrypt.default.hashSync(user.login + process.env.JWT_SECRET || 'default', 10));
    }

    const jwt = generateToken({ username: user.login, githubUser: user.login, avatar: user.avatar_url });

    // Store token in localStorage (popup relay), then close
    res.send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>登录成功</title></head><body>
      <script>
        localStorage.setItem('ru_admin_token', '${jwt}');
        localStorage.setItem('ru_admin_username', '${user.login}');
        localStorage.setItem('ru_admin_avatar', '${user.avatar_url || ''}');
        localStorage.setItem('ru_admin_ready', 'true');
        window.close();
      </script>
      <p style="text-align:center;font-family:sans-serif;padding-top:40px;color:#333;">
        登录成功！窗口即将关闭...<br>
        <small>如未关闭，请手动关闭此窗口</small>
      </p>
      </body></html>
    `);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.status(500).send('登录失败，请重试');
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
    const { slug, title, subtitle, category, cover_url, cover_alt, year, tags, content, sort_order } = req.body;

    if (!slug || !title || !category || !cover_url) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    db.prepare(
      'INSERT INTO collection_items (slug, title, subtitle, category, cover_url, cover_alt, year, tags, content, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(slug, title, subtitle || '', category, cover_url, cover_alt || '', year || new Date().getFullYear(), JSON.stringify(tags || []), content || '', sort_order || 0);

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

    const title = fields.title ?? existing.title;
    const subtitle = fields.subtitle ?? existing.subtitle;
    const category = fields.category ?? existing.category;
    const cover_url = fields.cover_url ?? existing.cover_url;
    const cover_alt = fields.cover_alt ?? existing.cover_alt;
    const year = fields.year ?? existing.year;
    const tags = fields.tags ? JSON.stringify(fields.tags) : existing.tags;
    const content = fields.content !== undefined ? fields.content : (existing.content || '');
    const sort_order = fields.sort_order !== undefined ? fields.sort_order : existing.sort_order;

    db.prepare(
      'UPDATE collection_items SET title=?, subtitle=?, category=?, cover_url=?, cover_alt=?, year=?, tags=?, content=?, sort_order=? WHERE slug=?'
    ).run(title, subtitle, category, cover_url, cover_alt, year, tags, content, sort_order, slug);

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
// ─── Image/Video/3D Upload — Cloudinary or local ───
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // Try Cloudinary first if configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const cloudinary = await import('cloudinary');
        cloudinary.v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const ext = path.extname(req.file.originalname).toLowerCase();
        const isVideo = /\.(mp4|webm|mov)$/i.test(ext);
        const isModel = /\.(glb|gltf)$/i.test(ext);

        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'ru-studio',
          resource_type: isVideo ? 'video' : isModel ? 'raw' : 'image',
          use_filename: true,
          unique_filename: true,
        });

        // Clean up local temp file
        fs.unlink(req.file.path, () => {});
        return res.json({ success: true, url: result.secure_url, filename: req.file.filename });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    // Local fallback
    const url = '/uploads/' + req.file.filename;
    res.json({ success: true, url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: '上传失败' });
  }
}, (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: '文件太大，最大支持 50MB' });
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

export default router;
