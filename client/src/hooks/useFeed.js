import { useState, useEffect, useCallback, useRef } from 'react';

// In-memory cache for ultra-fast 0ms tab switching
let memoryFeedCache = null;

/**
 * Custom Stale-While-Revalidate (SWR) hook for feed loading:
 * 1. Checks memory cache first -> returns instantaneously (0ms wait)
 * 2. Checks localStorage cache -> loads saved state immediately
 * 3. Fetches fresh updates in background and silently updates state
 */
export const useFeed = (userId) => {
  const [posts, setPosts] = useState(() => {
    // 1. Instant memory hit
    if (memoryFeedCache && memoryFeedCache.length > 0) {
      return memoryFeedCache;
    }
    // 2. LocalStorage hit
    try {
      const cached = localStorage.getItem('clickstar_feed_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        memoryFeedCache = parsed;
        return parsed;
      }
    } catch (e) {
      // Ignore storage errors
    }
    return [];
  });

  const [loading, setLoading] = useState(() => !memoryFeedCache || memoryFeedCache.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchFeed = useCallback(async (isBackground = false) => {
    if (!userId || isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isBackground && (!memoryFeedCache || memoryFeedCache.length === 0)) {
      setLoading(true);
    } else if (isBackground) {
      setRefreshing(true);
    }

    try {
      const res = await fetch(`/api/posts?userId=${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        memoryFeedCache = data.data;
        setPosts(data.data);
        try {
          // Persist top 30 posts for instant next-launch loading
          localStorage.setItem('clickstar_feed_cache', JSON.stringify(data.data.slice(0, 30)));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    // Trigger background revalidation immediately
    fetchFeed(!!memoryFeedCache && memoryFeedCache.length > 0);
  }, [fetchFeed]);

  const addPostOptimistic = useCallback((newPost) => {
    setPosts(prev => {
      const updated = [newPost, ...prev];
      memoryFeedCache = updated;
      try {
        localStorage.setItem('clickstar_feed_cache', JSON.stringify(updated.slice(0, 30)));
      } catch (e) {}
      return updated;
    });
  }, []);

  return {
    posts,
    setPosts,
    loading,
    refreshing,
    refetch: () => fetchFeed(true),
    addPostOptimistic,
  };
};

