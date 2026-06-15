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
      content TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS about_sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Migrate: add new columns if they don't exist (safe to run on existing DB)
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN content TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN image_url TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN content TEXT DEFAULT \'\''); } catch {}

  // Migrate: update email if it still has old default
  db.prepare('UPDATE site_config SET value = ? WHERE key = ? AND value = ?').run('wu27@qfnu.edu.cn', 'contactEmail', 'hello@rustudio.cn');

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
    insertConfig.run('contactEmail', 'wu27@qfnu.edu.cn');
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
      'INSERT INTO journal_posts (slug, title, excerpt, date, category, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const posts = [
      { slug: 'confucius-culture-festival', title: '中国国际孔子文化节参展回顾', excerpt: '为期七天的文化节中，我们的「文房静物」系列受到了来自全国各地文化爱好者的广泛关注。', date: '2024-09-28', category: '展览', content: '2024年9月，第三十九届中国国际孔子文化节在山东曲阜盛大开幕。本届文化节以"文明对话、和合共生"为主题，汇聚了来自30多个国家和地区的文化机构、学者与艺术家。\n\n作为扎根曲阜的本土文创品牌，"儒意"受邀在文化创意展区设立了独立展位。我们精心布置了以"文房静物"为主题的展示空间——以宣纸为墙、以砚台为景、以墨香为引，将传统书房的静谧之美搬进了现代展馆。\n\n展出的核心作品包括"论语书签"系列、"孔庙墨影"摄影长卷，以及首次公开亮相的"大成殿"建筑微雕模型。其中"论语书签"以青铜材质复刻竹简形制，表面镌刻微缩《论语》章句，在光影流转间呈现出古籍翻阅的视觉效果，成为全场最受瞩目的单品之一。\n\n七天展期内，我们的展位累计接待访客超过5000人次，收到合作意向近百份。许多年轻观众表示，这些作品让他们第一次感受到"原来儒家文化可以这么酷"。\n\n这次参展让我们更加坚定了方向：用当代的设计语言、年轻的表达方式，让千年文脉重新流转于日常之中。', image_url: '', order: 0 },
      { slug: 'new-product-launch', title: '秋冬新品「墨影」系列正式发布', excerpt: '以孔庙建筑光影为灵感，将飞檐斗拱的线条抽象为现代设计语言，打造兼具文化厚度与实用美学的日常器物。', date: '2024-10-15', category: '新品', content: '经过近半年的设计与打样，我们正式推出2024秋冬新品——「墨影」系列。\n\n这个系列的灵感来源于孔庙建筑的独特光影关系。我们花了整整两个月的时间，在不同季节、不同时段拍摄孔庙的飞檐、斗拱、廊柱与光影的交织变化，从中提取出最具代表性的线条与轮廓。\n\n「墨影」系列包含三款核心产品：\n\n1. 墨影书签套装——以孔庙大成殿飞檐的剪影为造型，采用黄铜蚀刻工艺，表面做旧处理，呈现出水墨画般的层次感。\n2. 光影笔记本——封面压印孔庙建筑群的线描图案，在不同角度下呈现出若隐若现的光影变化，内页选用80g象牙白道林纸，书写顺滑。\n3. 檐角尺——以斗拱结构为原型的黄铜直尺，既是文具，也是案头摆件。\n\n整个系列采用黑、白、金三色为主调，延续了"儒意"一贯的东方美学风格，同时更加注重产品的实用性与日常感。', image_url: '', order: 1 },
      { slug: 'university-cooperation', title: '与曲阜师范大学达成深度合作', excerpt: '双方将共同建立「儒家美学实验室」，推动学术研究成果向文创产品的系统性转化。', date: '2024-11-03', category: '合作', content: '11月3日，"儒意"与曲阜师范大学正式签署战略合作协议，双方将共建「儒家美学实验室」。\n\n签约仪式在曲阜师范大学科技楼举行。校方代表表示，曲阜师大作为坐落在孔子故里的高等学府，在儒家文化研究领域拥有深厚的学术积累，而"儒意"团队在设计转化与市场运营方面具备丰富经验，双方的合作将实现优势互补。\n\n「儒家美学实验室」将聚焦三个方向：\n\n一、文献解码——将《论语》《礼记》等经典中的美学思想、礼仪制度、器物描述进行系统梳理，建立可供设计师参考的"儒家美学数据库"。\n二、设计转译——由"儒意"设计团队根据学术研究成果，将抽象的哲学概念转化为具体的产品形态与视觉语言。\n三、市场验证——通过校园文创商店、线上渠道、文化市集等方式，测试产品在年轻消费者中的接受度，形成"研究-设计-反馈"的闭环。\n\n实验室首批项目将于2025年春季启动，敬请期待。', image_url: '', order: 2 },
      { slug: 'design-awards', title: '荣获2024年度文创设计金奖', excerpt: '「论语书签」在第十二届中国文创设计大赛中脱颖而出，获得评委一致好评。', date: '2024-12-01', category: '荣誉', content: '喜讯！「论语书签」在第十二届中国文创设计大赛中荣获金奖！\n\n本届大赛由中国文化产业协会主办，吸引了来自全国各地的近千件参赛作品。评审团由来自故宫博物院、中国美术学院、中央美术学院的专家学者组成，评选标准包括文化内涵、设计创新、工艺品质和市场潜力四个维度。\n\n「论语书签」以"古籍新作"的设计理念获得评委的一致认可。评审意见写道："作品以青铜材质复刻竹简形制，将《论语》文本微缩镌刻于方寸之间，既保留了古籍的质感与温度，又赋予了当代的审美与功能性。在材料选择、工艺处理和文化表达三个层面均达到了较高水准，是一件兼具文化厚度与市场潜力的优秀作品。"\n\n这份荣誉属于整个团队，也属于所有支持"儒意"的朋友们。我们将以此为动力，继续深耕儒家文化的当代化表达，推出更多有温度、有态度的作品。', image_url: '', order: 3 },
    ];
    posts.forEach((p) => insertPost.run(p.slug, p.title, p.excerpt, p.date, p.category, p.content, p.image_url, p.order));
  }

  // Seed about page sections
  const aboutCount = db.prepare('SELECT COUNT(*) as count FROM about_sections').get();
  if (aboutCount.count === 0) {
    const insertAbout = db.prepare('INSERT INTO about_sections (id, title, content, sort_order) VALUES (?, ?, ?, ?)');
    insertAbout.run('mission', '品牌使命', '以「向历史借灵感，为当代造美物」为核心理念，通过学术解码、创意转化、体验升级，让儒家文化从典籍与古迹中走出，成为可触摸、可使用、可共鸣的生活载体。', 0);
    insertAbout.run('vision', '品牌愿景', '构建「儒家文化阐释第一品牌」，打造集研究、设计、生产、销售于一体的文旅融合生态，成为连接传统文化与现代生活的核心桥梁。', 1);
    insertAbout.run('business', '核心业务板块', '01. 产品矩阵构建\n经典复刻、生活美学、互动体验、定制服务四大系列，覆盖从日常文具到高端收藏的全线产品。\n\n02. 体验场景打造\n线下体验空间、MR数字文创、校园传播三位一体的沉浸式文化消费场景。\n\n03. 文化传播运营\n内容引流、渠道渗透、公益联动，构建多维度的儒家文化传播体系。', 2);
    insertAbout.run('roadmap', '发展规划', '短期 1-2 年\n完善核心产品矩阵，打造3-5款年度爆款，实现年营收突破80万元。\n\n中期 3-5 年\n建立儒家文创设计标准体系，开展IP授权业务，拓展省外合作渠道。\n\n长期 5-10 年\n推动文创产品成为儒学海外传播载体，构建国际化文化品牌。', 3);
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
