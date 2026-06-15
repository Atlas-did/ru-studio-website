/**
 * Data access layer — fetches from API in production, falls back to hardcoded data.
 * Uses the same return types as the original data.ts for seamless migration.
 */

import type { SiteConfig, Concept, CollectionItem, JournalPost } from './data';
import { getSiteConfig, getConcepts, getCollectionItems, getJournalPosts } from './data';

const API_BASE = '';

// Track whether we successfully connected to the API
let apiAvailable: boolean | null = null;

async function tryApi<T>(path: string, fallback: () => T): Promise<T> {
  // If we already know API is down, use fallback immediately
  if (apiAvailable === false) {
    return fallback();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      apiAvailable = true;
      return res.json();
    }
    throw new Error(`API error: ${res.status}`);
  } catch {
    // First failure — mark API as unavailable
    if (apiAvailable === true) {
      // Was available, now it's down — try once more
      apiAvailable = null;
    } else {
      apiAvailable = false;
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
};
