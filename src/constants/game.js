/** How long two non-matching cards stay face up before turning back, in ms. */
export const FLIP_BACK_DELAY_MS = 1000;

/** Session states accepted by the backend `SessionState` enum. */
export const SESSION_STATES = Object.freeze({
  STARTED: 'Started',
  COMPLETED: 'Completed',
});
