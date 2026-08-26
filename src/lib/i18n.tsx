import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/* eslint-disable react-refresh/only-export-components -- context + hooks belong together */

export type Lang = 'zh' | 'en';

const DICT = {
  nav_home: { zh: '首页', en: 'Home' },
  nav_collection: { zh: '作品', en: 'Works' },
  nav_journal: { zh: '日志', en: 'Journal' },
  nav_press: { zh: '媒体', en: 'Press' },
  nav_cooperation: { zh: '合作', en: 'Cooperate' },
  nav_about: { zh: '关于', en: 'About' },
  subscribe_ok: { zh: '已收到你的订阅，新作品与展讯将第一时间送达。', en: 'Subscribed. New works and exhibitions will reach you first.' },
  subscribe_btn: { zh: '订阅', en: 'Join' },
  share_copy: { zh: '分享此作品', en: 'Share this work' },
  share_copied: { zh: '链接已复制 ✓', en: 'Link copied ✓' },
  view_works: { zh: '浏览作品 →', en: 'View work →' },
  next_work: { zh: 'NEXT WORK · 下一件', en: 'NEXT WORK' },
  story_label: { zh: 'STORY · 作品故事', en: 'STORY' },
  details_label: { zh: 'DETAILS · 细节', en: 'DETAILS' },
  gallery_hint: { zh: 'GALLERY — 拖拽浏览', en: 'GALLERY — drag to explore' },
} as const;

export type DictKey = keyof typeof DICT;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: 'zh',
  setLang: () => {},
  t: (k) => DICT[k].zh,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('ru_lang') : null;
    return saved === 'en' ? 'en' : 'zh';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('ru_lang', l);
    } catch { /* private mode */ }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key: DictKey) => DICT[key][lang] ?? DICT[key].zh,
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/**
 * Pick localized content field with graceful fallback.
 * Usage: pick(work, 'title', lang) → work.title_en || work.title
 */
export function pick(obj: object, field: string, lang: Lang): string {
  const rec = obj as Record<string, unknown>;
  if (lang === 'en') {
    const en = rec[`${field}_en`];
    if (en && typeof en === 'string' && en.trim()) return en;
  }
  const val = rec[field];
  return val == null ? '' : String(val);
}
