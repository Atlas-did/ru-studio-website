import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// GET /api/site-config
router.get('/site-config', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM site_config').all();
    const config = {};
    rows.forEach((row) => {
      config[row.key] = row.value;
    });
    res.json(config);
  } catch (err) {
    console.error('Error fetching site config:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/concepts
router.get('/concepts', (req, res) => {
  try {
    const db = getDb();
    const concepts = db.prepare('SELECT * FROM concepts ORDER BY sort_order ASC').all();
    res.json(concepts);
  } catch (err) {
    console.error('Error fetching concepts:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/collection
router.get('/collection', (req, res) => {
  try {
    const db = getDb();
    const { category } = req.query;

    let items;
    if (category) {
      items = db
        .prepare('SELECT * FROM collection_items WHERE category = ? ORDER BY sort_order ASC')
        .all(category);
    } else {
      items = db.prepare('SELECT * FROM collection_items ORDER BY sort_order ASC').all();
    }

    // Parse tags from JSON string to array
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
    console.error('Error fetching collection items:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/journal
router.get('/journal', (req, res) => {
  try {
    const db = getDb();
    const posts = db.prepare('SELECT * FROM journal_posts ORDER BY sort_order ASC').all();
    res.json(posts);
  } catch (err) {
    console.error('Error fetching journal posts:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/about
router.get('/about', (req, res) => {
  try {
    const db = getDb();
    const sections = db.prepare('SELECT * FROM about_sections ORDER BY sort_order ASC').all();
    res.json(sections);
  } catch (err) {
    console.error('Error fetching about sections:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/contact — submit contact form
router.post('/contact', (req, res) => {
  try {
    const db = getDb();
    const { name, organization, purpose, email, message } = req.body;

    if (!name || !purpose || !email) {
      return res.status(400).json({ error: '请填写必填字段' });
    }

    db.prepare(
      'INSERT INTO contacts (name, organization, purpose, email, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, organization || '', purpose, email, message || '');

    res.json({ success: true, message: '感谢您的来信，我们会尽快与您取得联系。' });
  } catch (err) {
    console.error('Error submitting contact:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
