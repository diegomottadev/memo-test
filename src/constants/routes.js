/** Values of the `:action` route param of a game session. */
export const SESSION_ACTIONS = Object.freeze({
  NEW: 'new',
  CONTINUE: 'continue',
});

/** Route patterns used by the router. */
export const ROUTES = Object.freeze({
  HOME: '/',
  GAME_SESSION: '/game/:gameId/session/:sessionId/:action',
});

/**
 * Builds the URL of a game session.
 *
 * @param {string} gameId - Memo test id.
 * @param {string} sessionId - Backend (or mock) session id.
 * @param {string} action - One of `SESSION_ACTIONS`.
 * @returns {string}
 */
export const buildGameSessionPath = (gameId, sessionId, action) =>
  `/game/${gameId}/session/${sessionId}/${action}`;
