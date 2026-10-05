/**
 * Runtime configuration read from Vite env variables (see `.env.example`).
 */

/** GraphQL endpoint of the backend. Empty means "run against the mocks". */
export const API_URL = import.meta.env.VITE_API_URL?.trim() || '';

/** True when no backend is configured and `src/api/mocks` must be used. */
export const USE_MOCKS = API_URL === '';

/** Text added at the end of every page title. */
export const APP_NAME = 'Memo Test';

/** After this time without an answer, the server counts as not available, in ms. */
export const REQUEST_TIMEOUT_MS = 5000;

/**
 * Where the data comes from:
 * - `server`: the GraphQL backend at `API_URL`.
 * - `mock`: no `API_URL`, so the app uses `src/api/mocks` from the start.
 * - `fallback`: `API_URL` is set but the server did not answer, so the app
 *   switched to the mocks until the page is loaded again.
 */
export const DATA_SOURCES = Object.freeze({
  SERVER: 'server',
  MOCK: 'mock',
  FALLBACK: 'fallback',
});
