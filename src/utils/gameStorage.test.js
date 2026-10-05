import { describe, expect, it } from 'vitest';
import {
  clearGameSession,
  loadActiveSessions,
  loadGameState,
  saveActiveSession,
  saveGameState,
} from './gameStorage';

describe('gameStorage', () => {
  it('lists unfinished sessions by memo test id', () => {
    saveActiveSession('1', '7');
    saveActiveSession('2', 8);
    window.localStorage.setItem('other', '"x"');
    expect(loadActiveSessions()).toEqual({ 1: '7', 2: '8' });
  });

  it('saves and loads the game state', () => {
    saveGameState('1', { retries: 3 });
    expect(loadGameState('1')).toEqual({ retries: 3 });
  });

  it('clears the session, the game and the keys of the old version', () => {
    saveActiveSession('1', '7');
    saveGameState('1', { retries: 3 });
    window.localStorage.setItem('memoGameCards_1', '[]');
    window.localStorage.setItem('memoTestSessionPairs_1', '[]');
    saveActiveSession('2', '9');

    clearGameSession('1');

    expect(Object.keys(window.localStorage)).toEqual(['memoTestSession_2']);
  });
});
