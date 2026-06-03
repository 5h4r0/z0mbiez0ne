import { useEffect, useState } from 'react';

export function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStatus(null);
    setData(null);
    fetch(url)
      .then((r) => {
        if (!cancelled) setStatus(r.status);
        if (!r.ok) {
          if (!cancelled) setError(`HTTP ${r.status}`);
          return;
        }
        return (r.json() as Promise<T>).then((d) => {
          if (!cancelled) setData(d);
        });
      })
      .catch(() => {
        if (!cancelled) setError('network error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error, status };
}
