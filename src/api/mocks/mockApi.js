import { STORAGE_KEYS } from '../../constants/storage';
import { readJson, writeJson } from '../../utils/storage';
import { MOCK_MEMO_TESTS } from './fixtures';

/**
 * API functions that run in the browser, with the same names and results as `memoTestApi.js`.
 * Sessions are saved in localStorage, so "Continue" and the best score
 * still work after a page reload, like with the real backend.
 */

/** Fake network delay, long enough to see the skeletons. */
const MOCK_LATENCY_MS = 300;

/**
 * Waits `MOCK_LATENCY_MS`. Stops early with an error if the request is cancelled.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
function delay(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, MOCK_LATENCY_MS);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

const loadDb = () => readJson(STORAGE_KEYS.mockDb, { sessions: [], nextSessionId: 1 });
const saveDb = (db) => writeJson(STORAGE_KEYS.mockDb, db);

/**
 * Merges `changes` into a stored session.
 *
 * An unknown session is created on the fly. This happens when a game started
 * on the real server and the app then switched to the mocks (fallback): the
 * player can still finish it and see the best score.
 *
 * @param {string} id - Session id.
 * @param {string} memoTestId - Memo test of the session, used when it is created.
 * @param {object} changes
 */
function upsertSession(id, memoTestId, changes) {
  const db = loadDb();
  let session = db.sessions.find((candidate) => candidate.id === String(id));
  if (!session) {
    session = {
      id: String(id),
      memoTestId: String(memoTestId ?? ''),
      retries: 0,
      matchedPairs: 0,
      score: 0,
    };
    db.sessions.push(session);
  }
  Object.assign(session, changes);
  saveDb(db);
}

/**
 * Works like the backend: the best score also counts unfinished sessions (score 0).
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import('../memoTestApi').MemoTestSummary[]>}
 */
export async function getMemoTests({ signal } = {}) {
  await delay(signal);
  const { sessions } = loadDb();
  return MOCK_MEMO_TESTS.map(({ id, name }) => {
    const scores = sessions.filter((session) => session.memoTestId === id).map((s) => s.score);
    return { id, name, maxScore: scores.length ? Math.max(...scores) : null };
  });
}

/**
 * @param {{ id: string, signal?: AbortSignal }} params
 * @returns {Promise<import('../memoTestApi').MemoTest|null>}
 */
export async function getMemoTest({ id, signal } = {}) {
  await delay(signal);
  return MOCK_MEMO_TESTS.find((candidate) => candidate.id === String(id)) ?? null;
}

/**
 * @param {{ memoTestId: string, signal?: AbortSignal }} params
 * @returns {Promise<{ id: string }>}
 */
export async function createGameSession({ memoTestId, signal } = {}) {
  await delay(signal);
  const db = loadDb();
  const session = {
    // The prefix keeps mock ids apart from server ids saved in localStorage.
    id: `mock-${db.nextSessionId}`,
    memoTestId: String(memoTestId),
    retries: 0,
    matchedPairs: 0,
    score: 0,
  };
  db.sessions.push(session);
  db.nextSessionId += 1;
  saveDb(db);
  return { id: session.id };
}

/**
 * @param {{ id: string, memoTestId?: string, retries: number, matchedPairs: number, signal?: AbortSignal }} params
 * @returns {Promise<void>}
 */
export async function updateGameSessionProgress({
  id,
  memoTestId,
  retries,
  matchedPairs,
  signal,
} = {}) {
  await delay(signal);
  upsertSession(id, memoTestId, { retries, matchedPairs });
}

/**
 * @param {{ id: string, memoTestId?: string, score: number, signal?: AbortSignal }} params
 * @returns {Promise<void>}
 */
export async function finishGameSession({ id, memoTestId, score, signal } = {}) {
  await delay(signal);
  upsertSession(id, memoTestId, { score });
}
