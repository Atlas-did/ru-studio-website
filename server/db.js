import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists (DATA_DIR env allows mounting a persistent volume)
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'rustudio.db');

// Select SQLite driver: node:sqlite (Node 22.5+) or better-sqlite3 fallback
let DatabaseSync;
try {
  const sqlite = await import('node:sqlite');
  DatabaseSync = sqlite.DatabaseSync;
  console.log('Using node:sqlite built-in module');
} catch {
  try {
    const require = createRequire(import.meta.url);
    DatabaseSync = require('better-sqlite3');
    console.log('Using better-sqlite3 (fallback)');
  } catch (e2) {
    console.error('No SQLite driver available. Install better-sqlite3 or upgrade to Node 22.5+.');
    console.error(e2.message);
    process.exit(1);
  }
}

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
      content TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pageviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      referrer TEXT DEFAULT '',
      day TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS press_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'coverage',
      title TEXT NOT NULL,
      url TEXT DEFAULT '',
      file_url TEXT DEFAULT '',
      logo_url TEXT DEFAULT '',
      source TEXT DEFAULT '',
      date TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Migrate: add new columns if they don't exist (safe to run on existing DB)
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN content TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN image_url TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN content TEXT DEFAULT \'\''); } catch {}
  // v3: immersive work detail + bilingual content fields
  try { db.exec("ALTER TABLE collection_items ADD COLUMN gallery TEXT DEFAULT '[]'"); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN video_url TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN title_en TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN subtitle_en TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE collection_items ADD COLUMN content_en TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN title_en TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN excerpt_en TEXT DEFAULT \'\''); } catch {}
  try { db.exec('ALTER TABLE journal_posts ADD COLUMN content_en TEXT DEFAULT \'\''); } catch {}

  // Migrate: update email if it still has old default
  db.prepare('UPDATE site_config SET value = ? WHERE key = ? AND value = ?').run('wu27@qfnu.edu.cn', 'contactEmail', 'hello@rustudio.cn');

  // Migrate: populate empty content fields for existing rows (Railway fix)
  const contentMap = {
    'confucius-culture-festival': '2024年9月，第三十九届中国国际孔子文化节在山东曲阜盛大开幕。本届文化节以"文明对话、和合共生"为主题，汇聚了来自30多个国家和地区的文化机构、学者与艺术家。\n\n作为扎根曲阜的本土文创品牌，"儒意"受邀在文化创意展区设立了独立展位。我们精心布置了以"文房静物"为主题的展示空间——以宣纸为墙、以砚台为景、以墨香为引，将传统书房的静谧之美搬进了现代展馆。\n\n展出的核心作品包括"论语书签"系列、"孔庙墨影"摄影长卷，以及首次公开亮相的"大成殿"建筑微雕模型。其中"论语书签"以青铜材质复刻竹简形制，表面镌刻微缩《论语》章句，在光影流转间呈现出古籍翻阅的视觉效果，成为全场最受瞩目的单品之一。\n\n七天展期内，我们的展位累计接待访客超过5000人次，收到合作意向近百份。许多年轻观众表示，这些作品让他们第一次感受到"原来儒家文化可以这么酷"。',
    'new-product-launch': '经过近半年的设计与打样，我们正式推出2024秋冬新品——「墨影」系列。\n\n这个系列的灵感来源于孔庙建筑的独特光影关系。我们花了整整两个月的时间，在不同季节、不同时段拍摄孔庙的飞檐、斗拱、廊柱与光影的交织变化，从中提取出最具代表性的线条与轮廓。\n\n「墨影」系列包含三款核心产品：墨影书签套装、光影笔记本、檐角尺。整个系列采用黑、白、金三色为主调，延续了"儒意"一贯的东方美学风格。',
    'university-cooperation': '11月3日，"儒意"与曲阜师范大学正式签署战略合作协议，双方将共建「儒家美学实验室」。\n\n签约仪式在曲阜师范大学科技楼举行。校方代表表示，曲阜师大作为坐落在孔子故里的高等学府，在儒家文化研究领域拥有深厚的学术积累，而"儒意"团队在设计转化与市场运营方面具备丰富经验，双方的合作将实现优势互补。\n\n「儒家美学实验室」将聚焦三个方向：文献解码、设计转译、市场验证。实验室首批项目将于2025年春季启动。',
    'design-awards': '喜讯！「论语书签」在第十二届中国文创设计大赛中荣获金奖！\n\n本届大赛由中国文化产业协会主办，吸引了来自全国各地的近千件参赛作品。评审团由来自故宫博物院、中国美术学院、中央美术学院的专家学者组成。\n\n评审意见写道："作品以青铜材质复刻竹简形制，将《论语》文本微缩镌刻于方寸之间，既保留了古籍的质感与温度，又赋予了当代的审美与功能性。"',
  };
  const updateContent = db.prepare('UPDATE journal_posts SET content = ? WHERE slug = ? AND (content IS NULL OR content = ?)');
  for (const [slug, content] of Object.entries(contentMap)) {
    updateContent.run(content, slug, '');
  }

  // Migrate: 为已存在的作品行补上故事正文（Railway 现有库自动生效，幂等）
  const collectionContentMap = {
    'bronze-bookmark':
      '「论语书签」最初的灵感，来自一句老话——「韦编三绝」。\n\n孔子晚年读《易》，反复翻阅以致编联竹简的皮绳断了三次。我们想，倘若把这样的书卷"折"成一方书签，让每一次读书，都像在重续一段千年未断的对话，该是件温柔的事。\n\n书签以黄铜为材，复刻竹简形制：一片薄而沉实的铜叶上，微缩《论语》章句以激光镌刻，笔画深浅有致，逆光时仿佛透出墨痕。边角做钝化处理，握在手里不硌、不凉，像握着一片被时光磨平的竹简。\n\n它不是一件张扬的摆件，而是日日陪你翻页的物件——当你把它别在书页之间，那句「学而时习之，不亦说乎」便恰好落在你要读的地方。\n\n工艺上，我们反复试验了四版蚀刻深度，最终让文字在 0.35mm 的铜面上既有浮雕的触感，又不至于刮伤纸张。器物之小，工序却一个不少。',
    'temple-ink':
      '「孔庙墨影」是一组关于光与影的建筑摄影。\n\n我们用了整整一年，在不同季节、不同时辰走进曲阜孔庙，只为了等一束对的斜阳。春分时分的晨光、秋日午后的低照、落雪前灰蓝的天光——每一幅都记录了斗拱与飞檐在特定光线下的一次显影。\n\n大成殿四周环列 28 根雕龙石柱，前檐 10 根为深浮雕双龙柱，高约六米。当光线贴柱扫过，龙身浮雕的明暗顿挫，像一篇立体的书法。我们刻意回避了"打卡式"的全景，而是把镜头对准局部：柱础的一角、瓦当的一片、彩绘剥落处的纹理。\n\n后期以去饱和的墨色处理，只保留黑、白与一点陈旧的暖灰，让建筑回到它最本分的模样。摄影机位从不停留于"到此一游"，而是想回答一个问题：当一座建筑在同一个地方站了六百年，它到底记住了什么。',
    'scholar-still':
      '「文房静物」拍摄于一个没有人工光源的午后。\n\n一张旧书案，一方歙砚，半支残墨，几卷毛边纸。窗外的天光斜斜落进来，在纸面上切出一道缓慢移动的边界——我们跟着那道光的移动，拍了一整天。\n\n宋人讲「格物」，说文房是「明窗净几，笔砚精良，人生一乐」。这组静物想拍的，不是器物本身，而是器物与人之间的那种沉默的相处：砚台磨过的地方微微凹陷，笔杆被握得发亮，纸角被风吹起又落下。\n\n每一处使用过的痕迹，都是时间的笔迹。我们不摆拍"精致"，只记录"用过"。正是这些日常的、有体温的痕迹，让文房四宝从博物馆的展柜里活了过来，重新回到一张普通的书桌上。',
    'temple-ink-2':
      '「大成殿」是我们「孔庙三部曲」的第一部影像作品，也是离建筑最近的一次凝视。\n\n曲阜孔庙大成殿面阔九间、进深五间，重檐九脊、黄瓦歇山顶，与故宫太和殿、岱庙天贶殿并称「东方三大殿」。殿前 28 根雕龙石柱之中，前檐 10 根深浮雕双龙柱相传为明弘治年间所刻，清雍正年间曾按紫禁城规格重修——六百年来，它一直站在这里，看着一代代读书人从殿下走过。\n\n镜头没有停留在恢宏的正面。我们沿着殿身缓步绕行，记录檐角的铜铃如何被风吹动、石柱的蟠龙如何在晨雾里若隐若现、丹墀上的石阶如何被千万双脚磨出温润的弧线。\n\n这部影像想传达的，不是一座建筑的雄伟，而是一种秩序：当建筑和它所承载的礼制一起，成为一座城市呼吸的一部分，它就不再是砖石，而是一种习惯、一种回望。',
    'bookmark-series':
      '「书签系列」是「论语书签」的延展，也是我们第一次尝试"系列化"地思考器物。\n\n单件书签是一种巧思，系列则是一种主张。我们从《论语》《大学》《中庸》中各自摘取一句，以三种不同的铜色与字体风格对应三种不同的读书心境：「学而时习之」用沉稳的哑光铜，仿若端坐晨读；「致知在格物」用温润的黄铜，带一点把玩的包浆感；「博学之，审问之」用做旧的深铜，像被读过很多遍的旧书。\n\n对制造者而言，系列化意味着把一次灵感变成一套可以延续的语言：统一的形制、递进的色彩、成组的语义。它们可以单买，也可以成组成为一份"读书人的礼"——这正是我们想做的：让文化不是孤件，而是一种可以被组合、被赠予、被传下去的生活方式。',
    'studio-objects':
      '「工作室物件」是一组几乎没有"作品感"的照片——它拍的是创作现场本身。\n\n工具摊在桌上，图纸卷了边，铜屑落了一地，半完成的样品和一杯放凉的茶并排。这些物件没有构图上的安排，它们的秩序来自真实的工作节奏：夹具、锉刀、放大镜、色卡，以及每一件作品的模型、草稿与废稿。\n\n我们想诚实一点。市面上多数品牌展示的是"完成后的光鲜"，但器物真正的尊严，往往在制作的过程中。\n\n这组静物是给所有创作者的一封留白：最动人的细节，常常藏在没有预谋的地方。镜头之外的我们，和镜头里的铜屑、茶渍一样，都还在打磨的路上。',
  };
  const updateCollectionContent = db.prepare(
    'UPDATE collection_items SET content = ? WHERE slug = ? AND (content IS NULL OR content = ?)'
  );
  for (const [slug, content] of Object.entries(collectionContentMap)) {
    updateCollectionContent.run(content, slug, '');
  }

  // Also populate about_sections if table exists but is empty
  const aboutCount = db.prepare('SELECT COUNT(*) as count FROM about_sections').get();
  if (aboutCount.count === 0) {
    seedAboutSections();
  }

  // Seed default data if tables are empty
  seedData();

  // 内容补充：为已存在的库幂等新增日志文章（INSERT OR IGNORE，重复部署不重复插入）
  const enrichPosts = db.prepare(
    'INSERT OR IGNORE INTO journal_posts (slug, title, excerpt, date, category, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const newPosts = [
    {
      slug: 'festival-four-numbers',
      title: '第 39 届孔子文化节的四个数字',
      excerpt: '1200 余人与会、39 个国家和地区、152 项文旅活动、2575 名学生尼山敬师礼——我们用四个数字回顾一场文化节。',
      date: '2024-10-07',
      category: '观察',
      content: '2024 年 9 月 27 日至 10 月 7 日，第 39 届中国国际孔子文化节在曲阜举行，主题为「对话孔子 互鉴文明」。我们作为参展品牌，全程见证了这场文化盛会。回看数据，有四个数字让我们格外触动。\n\n1200——本届文化节邀请与会嘉宾 1200 余人，来自 39 个国家和地区。当「仁」与「礼」不再只是课本上的词，而成为不同语言之间可以对话的共通语，文化节的边界便被打开了。\n\n152——文化节期间共推出 152 项文旅活动，从祭孔大典到文创市集，从尼山研学到非遗展演。152 这个数字告诉我们：文化的当代化，需要的不是单一的大场面，而是足够多、足够细、能让人走进来的小入口。\n\n2575——甲辰年公祭孔子大典上，2575 名学生身着汉服在尼山敬师行礼。2575 与孔子诞辰的年岁恰好对应。当一整代年轻人以庄重的姿态重新面对自己的传统，这比任何展陈都更有说服力。\n\n47.3 万——2024 年国庆假期，三孔景区接待游客 47.3 万人次，同比增长 4.3%。人流即是人心所向，越来越多的人愿意亲自站到大成殿前，看看那 28 根雕龙石柱。\n\n对文创从业者而言，这些数字既是市场的温度计，也是一份提醒：文化的力量不在口号里，而在每一次愿意走近的脚步声里。',
      image_url: '/assets/journal-festival.jpg',
      order: 4,
    },
    {
      slug: 'museum-cc-industry',
      title: '博物馆文创的 34 亿，与我们的选择',
      excerpt: '2024 年全国博物馆文创销售收入约 34.28 亿元、同比增长 63.7%——当文创成为风口，一家「慢品牌」该如何自处？',
      date: '2024-12-20',
      category: '观察',
      content: '按国家文物局口径，2024 年全国博物馆文创销售收入约 34.28 亿元，同比增长 63.7%；中国文创产品行业规模也来到约 999.82 亿元。文创，确确实实站上了风口。\n\n风口之下，最容易被问的问题是：你们为什么不做爆款？\n\n我们的答案，藏在作品里。「论语书签」从设计到定版，花了四个多月；「孔庙墨影」拍了整整一年。这个速度，在今天的行业里几乎可以说是"低效"的。但我们相信另一组数据：博物馆文创市场从 2016 年到 2023 年的复合年增长率约 22%——支撑这个增长的不是某一两个爆款，而是一代消费者对"文化质感"的持续渴望。\n\n爆款制造的是短暂的注意力，而文化需要的是长期的信任。我们的选择很简单：把每一件器物，都当成「要传下去的东西」来做。\n\n市场给了我们正向的回应——文化节上近百份合作意向、设计大赛的金奖、越来越多的研学机构找到我们。这些不是流量给的，是器物自己挣来的。\n\n34 亿证明市场很大，而我们要做的，是让每一件从我们手里出去的作品，都配得上「儒意」这两个字。',
      image_url: '/assets/work-bookmark-series.jpg',
      order: 5,
    },
  ];
  newPosts.forEach((p) => enrichPosts.run(p.slug, p.title, p.excerpt, p.date, p.category, p.content, p.image_url, p.order));

  return db;
}

function seedAboutSections() {
  const insertAbout = db.prepare('INSERT INTO about_sections (id, title, content, sort_order) VALUES (?, ?, ?, ?)');
  insertAbout.run('mission', '品牌使命', '以「向历史借灵感，为当代造美物」为核心理念，通过学术解码、创意转化、体验升级，让儒家文化从典籍与古迹中走出，成为可触摸、可使用、可共鸣的生活载体。', 0);
  insertAbout.run('vision', '品牌愿景', '构建「儒家文化阐释第一品牌」，打造集研究、设计、生产、销售于一体的文旅融合生态，成为连接传统文化与现代生活的核心桥梁。', 1);
  insertAbout.run('business', '核心业务板块', '01. 产品矩阵构建\n经典复刻、生活美学、互动体验、定制服务四大系列，覆盖从日常文具到高端收藏的全线产品。\n\n02. 体验场景打造\n线下体验空间、MR数字文创、校园传播三位一体的沉浸式文化消费场景。\n\n03. 文化传播运营\n内容引流、渠道渗透、公益联动，构建多维度的儒家文化传播体系。', 2);
  insertAbout.run('roadmap', '发展规划', '短期 1-2 年\n完善核心产品矩阵，打造3-5款年度爆款，实现年营收突破80万元。\n\n中期 3-5 年\n建立儒家文创设计标准体系，开展IP授权业务，拓展省外合作渠道。\n\n长期 5-10 年\n推动文创产品成为儒学海外传播载体，构建国际化文化品牌。', 3);
}

function seedData() {
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
      'INSERT INTO collection_items (slug, title, subtitle, category, cover_url, cover_alt, year, tags, gallery, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const items = [
      { slug: 'bronze-bookmark', title: '论语书签', subtitle: 'Bronze Bookmark with Analects', category: '装置', cover: '/assets/work-bookmark.jpg', alt: '青铜色书签，刻有微缩论语文字', year: 2024, tags: '["金属工艺","文字雕刻","文具"]', gallery: '["/assets/work-bookmark-detail.jpg"]', order: 0 },
      { slug: 'temple-ink', title: '孔庙墨影', subtitle: 'Temple Ink Shadow', category: '摄影', cover: '/assets/work-temple-ink.jpg', alt: '水墨风格孔庙飞檐斗拱', year: 2024, tags: '["建筑摄影","水墨","孔庙"]', gallery: '["/assets/crt-temple-texture.jpg"]', order: 1 },
      { slug: 'scholar-still', title: '文房静物', subtitle: "Scholar's Still Life", category: '摄影', cover: '/assets/work-still-life.jpg', alt: '文房四宝静物摄影，柔和窗光', year: 2024, tags: '["静物","文房","新中式"]', gallery: '["/assets/hero-ink-still.jpg","/assets/hero-still-life.jpg"]', order: 2 },
      { slug: 'temple-ink-2', title: '大成殿', subtitle: 'Dacheng Hall', category: '影像', cover: '/assets/work-dacheng.jpg', alt: '孔庙大成殿暮色建筑摄影', year: 2024, tags: '["建筑","孔庙","纪录片"]', gallery: '["/assets/work-temple-ink.jpg"]', order: 3 },
      { slug: 'bookmark-series', title: '书签系列', subtitle: 'Bookmark Collection', category: '装置', cover: '/assets/work-bookmark-series.jpg', alt: '黄铜书签系列平铺摄影', year: 2024, tags: '["金属工艺","系列","文具"]', gallery: '["/assets/work-bookmark.jpg","/assets/work-bookmark-detail.jpg"]', order: 4 },
      { slug: 'studio-objects', title: '工作室物件', subtitle: 'Studio Objects', category: '摄影', cover: '/assets/work-studio-objects.jpg', alt: '工作室案头物件与图纸', year: 2024, tags: '["静物","工作室","日常"]', gallery: '["/assets/about-atelier.jpg"]', order: 5 },
    ];
    items.forEach((item) => insertItem.run(item.slug, item.title, item.subtitle, item.category, item.cover, item.alt, item.year, item.tags, item.gallery, item.order));
  }

  // Seed journal posts
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM journal_posts').get();
  if (postsCount.count === 0) {
    const insertPost = db.prepare(
      'INSERT INTO journal_posts (slug, title, excerpt, date, category, content, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const posts = [
      { slug: 'confucius-culture-festival', title: '中国国际孔子文化节参展回顾', excerpt: '为期七天的文化节中，我们的「文房静物」系列受到了来自全国各地文化爱好者的广泛关注。', date: '2024-09-28', category: '展览', content: '2024年9月，第三十九届中国国际孔子文化节在山东曲阜盛大开幕。本届文化节以"文明对话、和合共生"为主题，汇聚了来自30多个国家和地区的文化机构、学者与艺术家。\n\n作为扎根曲阜的本土文创品牌，"儒意"受邀在文化创意展区设立了独立展位。我们精心布置了以"文房静物"为主题的展示空间——以宣纸为墙、以砚台为景、以墨香为引，将传统书房的静谧之美搬进了现代展馆。\n\n展出的核心作品包括"论语书签"系列、"孔庙墨影"摄影长卷，以及首次公开亮相的"大成殿"建筑微雕模型。其中"论语书签"以青铜材质复刻竹简形制，表面镌刻微缩《论语》章句，在光影流转间呈现出古籍翻阅的视觉效果，成为全场最受瞩目的单品之一。\n\n七天展期内，我们的展位累计接待访客超过5000人次，收到合作意向近百份。许多年轻观众表示，这些作品让他们第一次感受到"原来儒家文化可以这么酷"。\n\n这次参展让我们更加坚定了方向：用当代的设计语言、年轻的表达方式，让千年文脉重新流转于日常之中。', image_url: '/assets/journal-festival.jpg', order: 0 },
      { slug: 'new-product-launch', title: '秋冬新品「墨影」系列正式发布', excerpt: '以孔庙建筑光影为灵感，将飞檐斗拱的线条抽象为现代设计语言，打造兼具文化厚度与实用美学的日常器物。', date: '2024-10-15', category: '新品', content: '经过近半年的设计与打样，我们正式推出2024秋冬新品——「墨影」系列。\n\n这个系列的灵感来源于孔庙建筑的独特光影关系。我们花了整整两个月的时间，在不同季节、不同时段拍摄孔庙的飞檐、斗拱、廊柱与光影的交织变化，从中提取出最具代表性的线条与轮廓。\n\n「墨影」系列包含三款核心产品：\n\n1. 墨影书签套装——以孔庙大成殿飞檐的剪影为造型，采用黄铜蚀刻工艺，表面做旧处理，呈现出水墨画般的层次感。\n2. 光影笔记本——封面压印孔庙建筑群的线描图案，在不同角度下呈现出若隐若现的光影变化，内页选用80g象牙白道林纸，书写顺滑。\n3. 檐角尺——以斗拱结构为原型的黄铜直尺，既是文具，也是案头摆件。\n\n整个系列采用黑、白、金三色为主调，延续了"儒意"一贯的东方美学风格，同时更加注重产品的实用性与日常感。', image_url: '/assets/work-bookmark-series.jpg', order: 1 },
      { slug: 'university-cooperation', title: '与曲阜师范大学达成深度合作', excerpt: '双方将共同建立「儒家美学实验室」，推动学术研究成果向文创产品的系统性转化。', date: '2024-11-03', category: '合作', content: '11月3日，"儒意"与曲阜师范大学正式签署战略合作协议，双方将共建「儒家美学实验室」。\n\n签约仪式在曲阜师范大学科技楼举行。校方代表表示，曲阜师大作为坐落在孔子故里的高等学府，在儒家文化研究领域拥有深厚的学术积累，而"儒意"团队在设计转化与市场运营方面具备丰富经验，双方的合作将实现优势互补。\n\n「儒家美学实验室」将聚焦三个方向：\n\n一、文献解码——将《论语》《礼记》等经典中的美学思想、礼仪制度、器物描述进行系统梳理，建立可供设计师参考的"儒家美学数据库"。\n二、设计转译——由"儒意"设计团队根据学术研究成果，将抽象的哲学概念转化为具体的产品形态与视觉语言。\n三、市场验证——通过校园文创商店、线上渠道、文化市集等方式，测试产品在年轻消费者中的接受度，形成"研究-设计-反馈"的闭环。\n\n实验室首批项目将于2025年春季启动，敬请期待。', image_url: '/assets/about-atelier.jpg', order: 2 },
      { slug: 'design-awards', title: '荣获2024年度文创设计金奖', excerpt: '「论语书签」在第十二届中国文创设计大赛中脱颖而出，获得评委一致好评。', date: '2024-12-01', category: '荣誉', content: '喜讯！「论语书签」在第十二届中国文创设计大赛中荣获金奖！\n\n本届大赛由中国文化产业协会主办，吸引了来自全国各地的近千件参赛作品。评审团由来自故宫博物院、中国美术学院、中央美术学院的专家学者组成，评选标准包括文化内涵、设计创新、工艺品质和市场潜力四个维度。\n\n「论语书签」以"古籍新作"的设计理念获得评委的一致认可。评审意见写道："作品以青铜材质复刻竹简形制，将《论语》文本微缩镌刻于方寸之间，既保留了古籍的质感与温度，又赋予了当代的审美与功能性。在材料选择、工艺处理和文化表达三个层面均达到了较高水准，是一件兼具文化厚度与市场潜力的优秀作品。"\n\n这份荣誉属于整个团队，也属于所有支持"儒意"的朋友们。我们将以此为动力，继续深耕儒家文化的当代化表达，推出更多有温度、有态度的作品。', image_url: '/assets/work-bookmark-detail.jpg', order: 3 },
    ];
    posts.forEach((p) => insertPost.run(p.slug, p.title, p.excerpt, p.date, p.category, p.content, p.image_url, p.order));
  }

  // Seed about page sections
  const aboutCount = db.prepare('SELECT COUNT(*) as count FROM about_sections').get();
  if (aboutCount.count === 0) {
    seedAboutSections();
  }

  // Seed press / media coverage
  const pressCount = db.prepare('SELECT COUNT(*) as count FROM press_items').get();
  if (pressCount.count === 0) {
    const insertPress = db.prepare(
      "INSERT INTO press_items (id, type, title, url, file_url, logo_url, source, date, sort_order) VALUES (?, ?, ?, ?, '', '', ?, ?, ?)"
    );
    insertPress.run('press-cctv', 'coverage', '央视《文化十分》专题报道「儒意」文创设计', 'https://example.com/cctv-feature', 'CCTV', '2024-10-02', 0);
    insertPress.run('press-dazhong', 'coverage', '大众日报：从曲阜走出的青年文创品牌', 'https://example.com/dazhong-daily', '大众日报', '2024-11-12', 1);
    insertPress.run('press-qfnu', 'coverage', '曲师大新闻网：「儒家美学实验室」签约成立', 'https://example.com/qfnu-news', '曲阜师范大学', '2024-11-04', 2);
  }

  // Seed default admin: create only when explicitly allowed via env
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    const createDefault = process.env.CREATE_DEFAULT_ADMIN === 'true';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (createDefault && defaultPassword) {
      const hash = bcrypt.hashSync(defaultPassword, 10);
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
      console.log('Default admin created: username=admin (password from DEFAULT_ADMIN_PASSWORD)');
    } else {
      console.warn('No admin user exists. To create a default admin set CREATE_DEFAULT_ADMIN=true and DEFAULT_ADMIN_PASSWORD in env.');
    }
  }
}

export { getDb };
