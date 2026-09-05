/**
 * Central API base URL utility.
 * - Prioritizes VITE_API_URL (e.g. Render backend URL)
 * - In development: falls back to http://localhost:5000/api
 * - In production: falls back to relative /api
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const API_BASE = 
  import.meta.env.VITE_API_URL || 
  (isLocalhost ? 'http://localhost:5000/api' : '/api');
