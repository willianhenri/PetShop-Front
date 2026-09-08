import { useCallback, useEffect, useRef, useState } from 'react';
import { apiList } from '../services/apiFetch';

export function useCollection(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const activeRequest = useRef(null);
  const reload = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError('');
    try {
      const result = await apiList(path, { signal: controller.signal });
      if (!controller.signal.aborted) setData(result);
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    let disposed = false;
    void Promise.resolve().then(() => {
      if (!disposed) void reload();
    });
    return () => {
      disposed = true;
      activeRequest.current?.abort();
    };
  }, [reload]);

  return { data, loading, error, reload };
}
