/**
 * Data access layer — fetches from API in production, falls back to hardcoded data.
 * Uses the same return types as the original data.ts for seamless migration.
 */

import type { SiteConfig, Concept, CollectionItem, JournalPost } from './data';
import { getSiteConfig, getConcepts, getCollectionItems, getJournalPosts } from './data';

const API_BASE = '';

export interface PressItem {
  id: string;
  type: string;
  title: string;
  url?: string;
  file_url?: string;
  logo_url?: string;
  source?: string;
  date?: string;
}

// Track whether we successfully connected to the API.
// `false` is time-boxed: after API_DOWN_TTL_MS we retry instead of giving up forever.
let apiAvailable: boolean | null = null;
let apiDownSince = 0;
const API_DOWN_TTL_MS = 30_000;

async function tryApi<T>(path: string, fallback: () => T): Promise<T> {
  if (
    apiAvailable === false &&
    Date.now() - apiDownSince < API_DOWN_TTL_MS
  ) {
    return fallback();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      apiAvailable = true;
      apiDownSince = 0;
      return res.json();
    }
    throw new Error(`API error: ${res.status}`);
  } catch {
    // Mark API down with a timestamp so we retry after TTL
    if (apiAvailable !== false) {
      apiAvailable = false;
      apiDownSince = Date.now();
    }
    return fallback();
  }
}

export const api = {
  async getSiteConfig(): Promise<SiteConfig> {
    return tryApi('/api/site-config', () => {
      return getSiteConfig();
    });
  },

  async getConcepts(): Promise<Concept[]> {
    return tryApi('/api/concepts', () => {
      return getConcepts();
    });
  },

  async getCollectionItems(): Promise<CollectionItem[]> {
    return tryApi<CollectionItem[]>('/api/collection', () => {
      return getCollectionItems();
    }).then((items) =>
      // Normalize the shape: API returns flat fields, hardcoded returns nested cover object
      items.map((item: any) => ({
        ...item,
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle || undefined,
        category: item.category,
        year: item.year,
        tags: Array.isArray(item.tags) ? item.tags : item.tags ? JSON.parse(item.tags) : [],
        cover: item.cover || {
          id: item.slug,
          url: item.cover_url,
          alt: item.cover_alt,
          width: item.cover_width || 800,
          height: item.cover_height || 1067,
        },
      }))
    );
  },

  async getJournalPosts(): Promise<JournalPost[]> {
    return tryApi('/api/journal', () => {
      return getJournalPosts();
    });
  },

  async getAbout(): Promise<any[]> {
    return tryApi('/api/about', () => []);
  },

  async submitContact(data: {
    name: string;
    organization?: string;
    purpose: string;
    email: string;
    message?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    } catch {
      return { success: false, message: '提交失败，请稍后重试' };
    }
  },

  /** Newsletter subscription */
  async subscribe(email: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('subscribe failed');
    return res.json();
  },

  /** Press / media items */
  async getPress(): Promise<PressItem[]> {
    return tryApi<PressItem[]>('/api/press', () => []);
  },
};

/** Fire-and-forget pageview beacon (privacy friendly, no cookies) */
export function trackPageview(path: string) {
  try {
    const payload = JSON.stringify({ path, referrer: document.referrer || '' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE}/api/track`, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(`${API_BASE}/api/track`, { method: 'POST', body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never block navigation on analytics */
  }
}
