import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'rustudio.db');

let db = null;

function getDb() {
  if (db) return db;

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      numeral TEXT NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      category TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      cover_alt TEXT NOT NULL,
      cover_width INTEGER DEFAULT 800,
      cover_height INTEGER DEFAULT 1067,
      year INTEGER NOT NULL,
      tags TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS journal_posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT,
      purpose TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // Seed default data if tables are empty
  seedData();

  return db;
}

function seedData() {
  const db = getDb();

  // Seed site config
  const configCount = db.prepare('SELECT COUNT(*) as count FROM site_config').get();
  if (configCount.count === 0) {
    const insertConfig = db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)');
    insertConfig.run('brandName', '儒意');
    insertConfig.run('brandNameEn', 'RU STUDIO');
    insertConfig.run('tagline', '向历史借灵感，为当代造美物。');
    insertConfig.run('contactEmail', 'hello@rustudio.cn');
  }

  // Seed concepts
  const conceptsCount = db.prepare('SELECT COUNT(*) as count FROM concepts').get();
  if (conceptsCount.count === 0) {
    const insertConcept = db.prepare(
      'INSERT INTO concepts (id, numeral, title, title_en, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const concepts = [
      { id: 'classic', numeral: 'I', title: '经典复刻', titleEn: 'CLASSIC REPLICA', desc: '以孔府档案、孔庙建筑为蓝本，提取礼制符号与空间元素，将千年文物转化为可触可感的当代器物。', order: 0 },
      { id: 'aesthetics', numeral: 'II', title: '生活美学', titleEn: 'DAILY AESTHETICS', desc: '将儒家哲学融入日常，从茶染卷轴到节气箴言，让文化不再是博物馆里的陈列，而是生活里的温度。', order: 1 },
      { id: 'experience', numeral: 'III', title: '互动体验', titleEn: 'INTERACTIVE EXPERIENCE', desc: '通关文牒打卡、六艺主题DIY、Q版孔夫子盲盒——用年轻人的语言，让传统文化主动走向大众。', order: 2 },
      { id: 'custom', numeral: 'IV', title: '定制服务', titleEn: 'BESPOKE SERVICE', desc: '面向高校与企业的文化礼品定制，从校徽与儒家符号的结合到纪念礼盒的全案设计，一对一文化赋能。', order: 3 },
    ];
    concepts.forEach((c) => insertConcept.run(c.id, c.numeral, c.title, c.titleEn, c.desc, c.order));
  }

  // Seed collection items
  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM collection_items').get();
  if (itemsCount.count === 0) {
    const insertItem = db.prepare(
      'INSERT INTO collection_items (slug, title, subtitle, category, cover_url, cover_alt, year, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const items = [
      { slug: 'bronze-bookmark', title: '论语书签', subtitle: 'Bronze Bookmark with Analects', category: '装置', cover: '/assets/work-bookmark.jpg', alt: '青铜色书签，刻有微缩论语文字', year: 2024, tags: '["金属工艺","文字雕刻","文具"]', order: 0 },
      { slug: 'temple-ink', title: '孔庙墨影', subtitle: 'Temple Ink Shadow', category: '摄影', cover: '/assets/crt-temple-texture.jpg', alt: '黑白水墨风格孔庙建筑摄影', year: 2024, tags: '["建筑摄影","黑白","孔庙"]', order: 1 },
      { slug: 'scholar-still', title: '文房静物', subtitle: "Scholar's Still Life", category: '摄影', cover: '/assets/hero-still-life.jpg', alt: '毛笔、砚台、宣纸与几何直尺的静物摄影', year: 2024, tags: '["静物","文房","新中式"]', order: 2 },
      { slug: 'temple-ink-2', title: '大成殿', subtitle: 'Dacheng Hall', category: '影像', cover: '/assets/crt-temple-texture.jpg', alt: '孔庙大成殿建筑摄影', year: 2024, tags: '["建筑","孔庙","纪录片"]', order: 3 },
      { slug: 'bookmark-series', title: '书签系列', subtitle: 'Bookmark Collection', category: '装置', cover: '/assets/work-bookmark.jpg', alt: '青铜书签系列', year: 2024, tags: '["金属工艺","系列","文具"]', order: 4 },
      { slug: 'studio-objects', title: '工作室物件', subtitle: 'Studio Objects', category: '摄影', cover: '/assets/hero-still-life.jpg', alt: '工作室静物', year: 2024, tags: '["静物","工作室","日常"]', order: 5 },
    ];
    items.forEach((item) => insertItem.run(item.slug, item.title, item.subtitle, item.category, item.cover, item.alt, item.year, item.tags, item.order));
  }

  // Seed journal posts
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM journal_posts').get();
  if (postsCount.count === 0) {
    const insertPost = db.prepare(
      'INSERT INTO journal_posts (slug, title, excerpt, date, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const posts = [
      { slug: 'confucius-culture-festival', title: '中国国际孔子文化节参展回顾', excerpt: '为期七天的文化节中，我们的「文房静物」系列受到了来自全国各地文化爱好者的广泛关注。', date: '2024-09-28', category: '展览', order: 0 },
      { slug: 'new-product-launch', title: '秋冬新品「墨影」系列正式发布', excerpt: '以孔庙建筑光影为灵感，将飞檐斗拱的线条抽象为现代设计语言，打造兼具文化厚度与实用美学的日常器物。', date: '2024-10-15', category: '新品', order: 1 },
      { slug: 'university-cooperation', title: '与曲阜师范大学达成深度合作', excerpt: '双方将共同建立「儒家美学实验室」，推动学术研究成果向文创产品的系统性转化。', date: '2024-11-03', category: '合作', order: 2 },
      { slug: 'design-awards', title: '荣获2024年度文创设计金奖', excerpt: '「论语书签」在第十二届中国文创设计大赛中脱颖而出，获得评委一致好评。', date: '2024-12-01', category: '荣誉', order: 3 },
    ];
    posts.forEach((p) => insertPost.run(p.slug, p.title, p.excerpt, p.date, p.category, p.order));
  }

  // Seed default admin (username: admin, password: admin123)
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('Default admin created: username=admin, password=admin123');
  }
}

export { getDb };
