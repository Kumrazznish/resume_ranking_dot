/**
 * Central API base URL utility.
 * - In development (localhost): Uses VITE_API_URL or falls back to http://localhost:5000/api
 * - In production (Vercel / any deployed host): Uses a relative /api path so it hits
 *   the same origin's serverless function routes defined in vercel.json
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const API_BASE = isLocalhost
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  : '/api';
