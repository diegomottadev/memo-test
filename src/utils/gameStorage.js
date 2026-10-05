import { STORAGE_KEYS } from '../constants/storage';
import { listKeys, readJson, removeKeys, writeJson } from './storage';

/**
 * Persistence of unfinished games, keyed by memo test id.
 */

/**
 * @returns {Record<string, string>} Map of memo test id to unfinished session id.
 */
export function loadActiveSessions() {
  return listKeys()
    .filter((key) => key.startsWith(STORAGE_KEYS.activeSessionPrefix))
    .reduce((sessions, key) => {
      const sessionId = readJson(key);
      if (sessionId !== null) {
        sessions[key.slice(STORAGE_KEYS.activeSessionPrefix.length)] = String(sessionId);
      }
      return sessions;
    }, {});
}

/**
 * @param {string} memoTestId
 * @param {string} sessionId
 */
export function saveActiveSession(memoTestId, sessionId) {
  writeJson(STORAGE_KEYS.activeSession(memoTestId), String(sessionId));
}

/**
 * @param {string} memoTestId
 * @returns {object|null} The saved game (see `utils/game.js`), unvalidated.
 */
export function loadGameState(memoTestId) {
  return readJson(STORAGE_KEYS.gameState(memoTestId));
}

/**
 * @param {string} memoTestId
 * @param {object} game - Game state from `utils/game.js`.
 */
export function saveGameState(memoTestId, game) {
  writeJson(STORAGE_KEYS.gameState(memoTestId), game);
}

/**
 * Forgets the unfinished game of a memo test, including keys from the old version.
 *
 * @param {string} memoTestId
 */
export function clearGameSession(memoTestId) {
  removeKeys(
    STORAGE_KEYS.activeSession(memoTestId),
    STORAGE_KEYS.gameState(memoTestId),
    ...STORAGE_KEYS.legacy(memoTestId),
  );
}
