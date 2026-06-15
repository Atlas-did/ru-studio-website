import { useState, useEffect, useRef } from 'react';

interface UseSiteDataOptions<T> {
  /** Initial data to show while fetching (no loading state) */
  initialData?: T;
  /** Whether to skip the fetch (useful when data is already provided) */
  skip?: boolean;
}

interface UseSiteDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Generic hook for fetching site data from the API.
 * Falls back gracefully if the API is unavailable.
 * Pass `initialData` to avoid a loading flash — the hook still fetches
 * in the background to get the latest data.
 */
export function useSiteData<T>(
  fetcher: () => Promise<T>,
  options: UseSiteDataOptions<T> = {}
): UseSiteDataResult<T> {
  const { initialData, skip = false } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData && !skip);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const fetchId = useRef(0);

  const fetchData = () => {
    if (skip) return;

    const id = ++fetchId.current;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (mounted.current && id === fetchId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current && id === fetchId.current) {
          setError(err.message || '获取数据失败');
          setLoading(false);
          // Keep initialData or previous data on error
          if (!data && initialData) {
            setData(initialData);
          }
        }
      });
  };

  useEffect(() => {
    mounted.current = true;
    // If we have initialData, we can skip the initial fetch
    // (data is already displayed) — but still refresh once
    if (initialData) {
      // Fetch fresh data in the background
      fetchData();
    } else if (!skip) {
      fetchData();
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  return { data, loading, error, refresh: fetchData };
}
