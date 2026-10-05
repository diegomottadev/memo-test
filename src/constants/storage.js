/**
 * Every localStorage key used by the app. Renaming a key here changes where
 * saved games are read from, so existing saved games would be ignored.
 */
export const STORAGE_KEYS = Object.freeze({
  /** Id of the unfinished session of a memo test. */
  activeSession: (memoTestId) => `memoTestSession_${memoTestId}`,
  activeSessionPrefix: 'memoTestSession_',
  /** Board, clicks and matched pairs of the unfinished game of a memo test. */
  gameState: (memoTestId) => `memoGameState_${memoTestId}`,
  /** Keys written by the previous version of the app; removed when a game ends. */
  legacy: (memoTestId) => [`memoTestSessionPairs_${memoTestId}`, `memoGameCards_${memoTestId}`],
  /** Sessions stored by the mock API. */
  mockDb: 'memoTest.mockDb',
});
