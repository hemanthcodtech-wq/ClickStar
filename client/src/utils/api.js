
/**
 * Central API Client Config
 * When VITE_BACKEND_URL is provided (production cross-origin deployment on Vercel),
 * prepends the backend origin to /api endpoints.
 * In local dev, relative paths (e.g. /api/posts) work with Vite proxy seamlessly.
 */
export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Enhanced fetch wrapper that automatically prefixes API_BASE_URL
 * for any request targeting /api routes.
 */
const originalFetch = window.fetch.bind(window);

export const apiFetch = (url, options) => {
  const finalUrl = typeof url === 'string' && url.startsWith('/api') 
    ? `${API_BASE_URL}${url}` 
    : url;
  return originalFetch(finalUrl, options);
};

// Automatically patch window.fetch so every existing fetch('/api/...') in all components
// immediately routes to the production backend when VITE_BACKEND_URL is set!
if (typeof window !== 'undefined' && API_BASE_URL) {
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${API_BASE_URL}${input}`, init);
    }
    return originalFetch(input, init);
  };
}
