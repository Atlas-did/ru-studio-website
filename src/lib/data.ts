export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface CollectionItem {
  slug: string;
  title: string;
  subtitle?: string;
  category: '影像' | '摄影' | '装置' | '纪录';
  cover: MediaAsset;
  year: number;
  tags: string[];
}

export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export interface Concept {
  id: string;
  numeral: string;
  title: string;
  titleEn: string;
  description: string;
}

export interface SiteConfig {
  brandName: string;
  brandNameEn: string;
  tagline: string;
  contactEmail: string;
}

export function getSiteConfig(): SiteConfig {
  return {
    brandName: '儒意',
    brandNameEn: 'RU STUDIO',
    tagline: '向历史借灵感，为当代造美物。',
    contactEmail: 'hello@rustudio.cn',
  };
}

export function getConcepts(): Concept[] {
  return [
    {
      id: 'classic',
      numeral: 'I',
      title: '经典复刻',
      titleEn: 'CLASSIC REPLICA',
      description: '以孔府档案、孔庙建筑为蓝本，提取礼制符号与空间元素，将千年文物转化为可触可感的当代器物。',
    },
    {
      id: 'aesthetics',
      numeral: 'II',
      title: '生活美学',
      titleEn: 'DAILY AESTHETICS',
      description: '将儒家哲学融入日常，从茶染卷轴到节气箴言，让文化不再是博物馆里的陈列，而是生活里的温度。',
    },
    {
      id: 'experience',
      numeral: 'III',
      title: '互动体验',
      titleEn: 'INTERACTIVE EXPERIENCE',
      description: '通关文牒打卡、六艺主题DIY、Q版孔夫子盲盒——用年轻人的语言，让传统文化主动走向大众。',
    },
    {
      id: 'custom',
      numeral: 'IV',
      title: '定制服务',
      titleEn: 'BESPOKE SERVICE',
      description: '面向高校与企业的文化礼品定制，从校徽与儒家符号的结合到纪念礼盒的全案设计，一对一文化赋能。',
    },
  ];
}

export function getCollectionItems(): CollectionItem[] {
  return [
    {
      slug: 'bronze-bookmark',
      title: '论语书签',
      subtitle: 'Bronze Bookmark with Analects',
      category: '装置',
      year: 2024,
      cover: {
        id: 'bm-1',
        url: '/assets/work-bookmark.jpg',
        alt: '青铜色书签，刻有微缩论语文字',
        width: 800,
        height: 1067,
      },
      tags: ['金属工艺', '文字雕刻', '文具'],
    },
    {
      slug: 'temple-ink',
      title: '孔庙墨影',
      subtitle: 'Temple Ink Shadow',
      category: '摄影',
      year: 2024,
      cover: {
        id: 'ti-1',
        url: '/assets/crt-temple-texture.jpg',
        alt: '黑白水墨风格孔庙建筑摄影',
        width: 1200,
        height: 675,
      },
      tags: ['建筑摄影', '黑白', '孔庙'],
    },
    {
      slug: 'scholar-still',
      title: '文房静物',
      subtitle: "Scholar's Still Life",
      category: '摄影',
      year: 2024,
      cover: {
        id: 'ss-1',
        url: '/assets/hero-still-life.jpg',
        alt: '毛笔、砚台、宣纸与几何直尺的静物摄影',
        width: 800,
        height: 1067,
      },
      tags: ['静物', '文房', '新中式'],
    },
    {
      slug: 'temple-ink-2',
      title: '大成殿',
      subtitle: 'Dacheng Hall',
      category: '影像',
      year: 2024,
      cover: {
        id: 'ti-2',
        url: '/assets/crt-temple-texture.jpg',
        alt: '孔庙大成殿建筑摄影',
        width: 1200,
        height: 675,
      },
      tags: ['建筑', '孔庙', '纪录片'],
    },
    {
      slug: 'bookmark-series',
      title: '书签系列',
      subtitle: 'Bookmark Collection',
      category: '装置',
      year: 2024,
      cover: {
        id: 'bm-2',
        url: '/assets/work-bookmark.jpg',
        alt: '青铜书签系列',
        width: 800,
        height: 1067,
      },
      tags: ['金属工艺', '系列', '文具'],
    },
    {
      slug: 'studio-objects',
      title: '工作室物件',
      subtitle: 'Studio Objects',
      category: '摄影',
      year: 2024,
      cover: {
        id: 'so-1',
        url: '/assets/hero-still-life.jpg',
        alt: '工作室静物',
        width: 800,
        height: 1067,
      },
      tags: ['静物', '工作室', '日常'],
    },
  ];
}

export function getJournalPosts(): JournalPost[] {
  return [
    {
      slug: 'confucius-culture-festival',
      title: '中国国际孔子文化节参展回顾',
      excerpt: '为期七天的文化节中，我们的「文房静物」系列受到了来自全国各地文化爱好者的广泛关注。',
      date: '2024-09-28',
      category: '展览',
    },
    {
      slug: 'new-product-launch',
      title: '秋冬新品「墨影」系列正式发布',
      excerpt: '以孔庙建筑光影为灵感，将飞檐斗拱的线条抽象为现代设计语言，打造兼具文化厚度与实用美学的日常器物。',
      date: '2024-10-15',
      category: '新品',
    },
    {
      slug: 'university-cooperation',
      title: '与曲阜师范大学达成深度合作',
      excerpt: '双方将共同建立「儒家美学实验室」，推动学术研究成果向文创产品的系统性转化。',
      date: '2024-11-03',
      category: '合作',
    },
    {
      slug: 'design-awards',
      title: '荣获2024年度文创设计金奖',
      excerpt: '「论语书签」在第十二届中国文创设计大赛中脱颖而出，获得评委一致好评。',
      date: '2024-12-01',
      category: '荣誉',
    },
  ];
}
