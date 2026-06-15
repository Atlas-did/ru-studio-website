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
router.post('/contact', async (req, res) => {
  try {
    const db = getDb();
    const { name, organization, purpose, email, message } = req.body;

    if (!name || !purpose || !email) {
      return res.status(400).json({ error: '请填写必填字段' });
    }

    db.prepare(
      'INSERT INTO contacts (name, organization, purpose, email, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, organization || '', purpose, email, message || '');

    // Try to send email notification (silently fail if SMTP not configured)
    try {
      const nodemailer = await import('nodemailer');
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const notifyEmail = process.env.NOTIFY_EMAIL || 'wu27@qfnu.edu.cn';

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: smtpUser,
          to: notifyEmail,
          subject: `[RU STUDIO] 新的合作联系：${purpose}`,
          html: `
            <h3>新的合作联系</h3>
            <p><strong>姓名：</strong>${name}</p>
            <p><strong>机构：</strong>${organization || '未填写'}</p>
            <p><strong>合作意向：</strong>${purpose}</p>
            <p><strong>邮箱：</strong>${email}</p>
            <p><strong>备注：</strong>${message || '无'}</p>
            <hr/>
            <p style="color:#888;font-size:12px;">此邮件由 RU STUDIO 官网自动发送。登录 <a href="${process.env.SITE_URL || ''}/#/admin">管理后台</a> 查看所有留言。</p>
          `,
        });
        console.log('Email notification sent to', notifyEmail);
      }
    } catch (emailErr) {
      console.log('Email not sent (SMTP not configured):', emailErr.message);
    }

    res.json({ success: true, message: '感谢您的来信，我们会尽快与您取得联系。' });
  } catch (err) {
    console.error('Error submitting contact:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
