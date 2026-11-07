/**
 * Global In-Memory and LocalStorage Cache Manager
 * Prevents redundant re-fetching when navigating across pages/tabs.
 * Only fetches when the user explicitly triggers a refresh or on fresh browser launch.
 */

const memoryCache = new Map();

export const cacheGet = (key) => {
  // 1. Check memory cache (0ms)
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  // 2. Check localStorage
  try {
    const raw = localStorage.getItem(`clickstar_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return null;
};

export const cacheSet = (key, data, persistToLocalStorage = true) => {
  memoryCache.set(key, data);
  if (persistToLocalStorage) {
    try {
      localStorage.setItem(`clickstar_cache_${key}`, JSON.stringify(data));
    } catch (e) {
      // Storage quota safety
    }
  }
};

export const cacheClear = (key) => {
  if (key) {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(`clickstar_cache_${key}`);
    } catch (e) {}
  } else {
    memoryCache.clear();
  }
};

