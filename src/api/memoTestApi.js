import { SESSION_STATES } from '../constants/game';
import { graphqlRequest } from './graphqlRequest';
import {
  CREATE_GAME_SESSION_MUTATION,
  FINISH_GAME_SESSION_MUTATION,
  MEMO_TEST_QUERY,
  MEMO_TESTS_QUERY,
  UPDATE_GAME_SESSION_PROGRESS_MUTATION,
} from './queries';

/**
 * API functions that talk to the real backend over HTTP. Every function accepts
 * the request options of `graphqlRequest` (`signal`, `baseUrl`, `fetchImpl`) and
 * returns data in the shape the UI uses. `mocks/mockApi.js` has the same functions.
 *
 * @typedef {object} MemoTestSummary
 * @property {string} id
 * @property {string} name
 * @property {number|null} maxScore - Best score among its sessions, or null if never played.
 *
 * @typedef {object} MemoTestImage
 * @property {string} id
 * @property {string} url
 * @property {string} label - Accessible name used to describe the card when face up.
 *
 * @typedef {object} MemoTest
 * @property {string} id
 * @property {string} name
 * @property {MemoTestImage[]} images
 */

/**
 * @param {object} raw - `memoTests` item from the backend.
 * @returns {MemoTestSummary}
 */
const toMemoTestSummary = ({ id, name, scoreMax }) => ({
  id: String(id),
  name,
  maxScore: scoreMax ? scoreMax.score : null,
});

/**
 * The backend has no text for each image, so we name images by position.
 * Both cards of a pair get the same name, so players can match them.
 *
 * @param {object} raw - `memoTest` object from the backend.
 * @returns {MemoTest}
 */
const toMemoTest = ({ id, name, images }) => ({
  id: String(id),
  name,
  images: images.map((image, index) => ({
    id: String(image.id),
    url: image.image_url,
    label: `Picture ${index + 1}`,
  })),
});

/**
 * Lists all memo tests.
 *
 * @param {object} [options] - Request options forwarded to `graphqlRequest`.
 * @returns {Promise<MemoTestSummary[]>}
 */
export async function getMemoTests(options) {
  const data = await graphqlRequest(MEMO_TESTS_QUERY, {}, options);
  return data.memoTests.map(toMemoTestSummary);
}

/**
 * Fetches a memo test with its images.
 *
 * @param {object} params
 * @param {string} params.id - Memo test id.
 * @returns {Promise<MemoTest|null>} Null when the id does not exist.
 */
export async function getMemoTest({ id, ...options }) {
  const data = await graphqlRequest(MEMO_TEST_QUERY, { id }, options);
  return data.memoTest ? toMemoTest(data.memoTest) : null;
}

/**
 * Starts a game session with no clicks and no matched pairs.
 *
 * @param {object} params
 * @param {string} params.memoTestId
 * @returns {Promise<{ id: string }>} The new session id.
 */
export async function createGameSession({ memoTestId, ...options }) {
  const data = await graphqlRequest(
    CREATE_GAME_SESSION_MUTATION,
    { memo_test_id: memoTestId, retries: 0, number_of_pairs: 0, state: SESSION_STATES.STARTED },
    options,
  );
  return { id: String(data.createGameSession.id) };
}

/**
 * Saves the progress of a session.
 *
 * @param {object} params
 * @param {string} params.id - Session id.
 * @param {number} params.retries - Card clicks so far.
 * @param {number} params.matchedPairs - Pairs found so far.
 * @returns {Promise<void>}
 */
export async function updateGameSessionProgress({ id, retries, matchedPairs, ...options }) {
  await graphqlRequest(
    UPDATE_GAME_SESSION_PROGRESS_MUTATION,
    { id, retries, number_of_pairs: matchedPairs },
    options,
  );
}

/**
 * Saves the final score of a session.
 *
 * The backend schema has `endGameSession`, but no code (resolver) behind it, so
 * the session state stays "Started". Only the score is saved.
 *
 * @param {object} params
 * @param {string} params.id - Session id.
 * @param {number} params.score - Final score (0-100).
 * @returns {Promise<void>}
 */
export async function finishGameSession({ id, score, ...options }) {
  await graphqlRequest(FINISH_GAME_SESSION_MUTATION, { id, score }, options);
}
