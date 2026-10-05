import { DATA_SOURCES } from '../constants/config';
import { isUnavailableError } from './graphqlRequest';

/** Names of the functions of the API contract (see `memoTestApi.js`). */
export const API_METHODS = [
  'getMemoTests',
  'getMemoTest',
  'createGameSession',
  'updateGameSessionProgress',
  'finishGameSession',
];

/**
 * Builds the API used by the app, with automatic fallback to the mocks.
 *
 * While the source is `server`, every call goes to `httpApi`. If a call fails
 * because the server is not available (see `isUnavailableError`), the source
 * changes to `fallback` and the same call runs again on `mockApi`, so the user
 * does not see an error. After that, every call uses the mocks until the page
 * is loaded again; going back and forth would mix data from both sources.
 *
 * @param {object} params
 * @param {boolean} params.useServer - False when no API URL is configured.
 * @param {Record<string, Function>} params.httpApi - Real implementation.
 * @param {Record<string, Function>} params.mockApi - Mock implementation.
 * @returns {Record<string, Function> & {
 *   getDataSource: () => 'server'|'mock'|'fallback',
 *   subscribeDataSource: (listener: () => void) => () => void,
 * }} The API functions plus a small store with the current data source.
 */
export default function createApi({ useServer, httpApi, mockApi }) {
  let source = useServer ? DATA_SOURCES.SERVER : DATA_SOURCES.MOCK;
  const listeners = new Set();

  function switchToFallback(error) {
    if (source === DATA_SOURCES.FALLBACK) return;
    console.warn('The server is not available, so the app uses sample data:', error);
    source = DATA_SOURCES.FALLBACK;
    listeners.forEach((listener) => listener());
  }

  function withFallback(method) {
    return async (params = {}) => {
      if (source !== DATA_SOURCES.SERVER) return mockApi[method](params);
      try {
        return await httpApi[method](params);
      } catch (error) {
        if (params.signal?.aborted || !isUnavailableError(error)) throw error;
        switchToFallback(error);
        return mockApi[method](params);
      }
    };
  }

  const api = Object.fromEntries(API_METHODS.map((method) => [method, withFallback(method)]));

  return {
    ...api,
    getDataSource: () => source,
    subscribeDataSource: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
