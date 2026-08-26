import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Routes belonging to the light 「宣」 reading chapter. Everything else is dark 「墨」.
 *  /about 与 /cooperation 使用 bg-ink 深色背景，应跟随墨色叙事，故不列入浅色路由。 */
const PAPER_ROUTES = ['/journal', '/press'];

function resolveTheme(pathname: string): 'ink' | 'paper' {
  return PAPER_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ? 'paper' : 'ink';
}

/**
 * Applies the chapter theme ([data-theme]) for the current route.
 * Individual sections may still locally override with their own data-theme attr.
 */
export function useChapterTheme() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Strip locale prefix for theme resolution
    const bare = pathname.startsWith('/en/') || pathname === '/en' ? pathname.slice(3) : pathname;
    document.documentElement.dataset.theme = resolveTheme(bare || '/');
  }, [pathname]);
}
