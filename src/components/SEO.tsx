import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description?: string;
  /** Path without locale prefix, e.g. "/collection/xxx" */
  path?: string;
  type?: 'website' | 'article';
  /** Optional absolute URL to a share image */
  image?: string;
  /** JSON-LD structured data object(s) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

const SITE_NAME = '儒意 RU STUDIO';
const DEFAULT_DESC = '儒意 RU STUDIO —— 儒家文化创意工作室。向历史借灵感，为当代造美物。构建儒家文化阐释第一品牌。';
const BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) || '';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Lightweight per-page head manager: title / description / Open Graph /
 * Twitter card / canonical / JSON-LD — no external dependency.
 */
export default function SEO({
  title,
  description = DEFAULT_DESC,
  path = '',
  type = 'website',
  image,
  jsonLd,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    const url = BASE_URL ? `${BASE_URL}${path}` : path || undefined;
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    if (url) upsertMeta('property', 'og:url', url);
    if (image) {
      upsertMeta('property', 'og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
      upsertMeta('name', 'twitter:card', 'summary_large_image');
      upsertMeta('name', 'twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    }
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    if (url) canonical.href = url;

    // JSON-LD
    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const item of items) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(item);
        document.head.appendChild(s);
        scripts.push(s);
      }
    }

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, path, type, image, jsonLd, noIndex]);

  return null;
}
