import { useEffect, useState } from 'react';
import api from '../api';
import { FLIP_BACK_DELAY_MS } from '../constants/game';
import {
  calculateScore,
  createGame,
  describeFlip,
  flipCard,
  hideSelected,
  isBoardLocked,
  isGameComplete,
  restoreGame,
} from '../utils/game';
import { clearGameSession, loadGameState, saveGameState } from '../utils/gameStorage';

const logSyncError = (error) => console.error('Could not save game progress:', error);

/**
 * State of one game. The rules live in `utils/game.js`; this hook wires them to
 * time (flip back), localStorage (resume) and the backend (progress). Saving the
 * final score belongs to the page, which shows the saving status.
 *
 * @param {object} params
 * @param {import('../api/memoTestApi').MemoTest} params.memoTest
 * @param {string} params.sessionId
 * @param {boolean} params.resume - Try to restore the saved game instead of dealing a new one.
 * @param {(score: number) => void} params.onFinish - Called once, when the last pair is found.
 * @returns {{
 *   cards: import('../utils/game').Card[],
 *   retries: number,
 *   matchedPairs: number,
 *   totalPairs: number,
 *   locked: boolean,
 *   announcement: string,
 *   flip: (cardId: string) => void,
 * }}
 */
export default function useMemoGame({ memoTest, sessionId, resume, onFinish }) {
  const memoTestId = memoTest.id;
  const [game, setGame] = useState(
    () =>
      (resume && restoreGame(loadGameState(memoTestId), memoTest.images)) ||
      createGame(memoTest.images),
  );
  const [announcement, setAnnouncement] = useState('');
  const locked = isBoardLocked(game);

  useEffect(() => {
    if (!locked) return undefined;
    const timer = setTimeout(() => setGame(hideSelected), FLIP_BACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [locked]);

  // Keeps the saved game in sync; a finished game is cleared in `flip` instead.
  useEffect(() => {
    if (!isGameComplete(game)) saveGameState(memoTestId, game);
  }, [memoTestId, game]);

  function flip(cardId) {
    const next = flipCard(game, cardId);
    if (next === game) return;
    setGame(next);
    setAnnouncement(describeFlip(game, next, cardId));

    if (next.matchedPairs > game.matchedPairs) {
      api
        .updateGameSessionProgress({
          id: sessionId,
          memoTestId,
          retries: next.retries,
          matchedPairs: next.matchedPairs,
        })
        .catch(logSyncError);
    }

    if (isGameComplete(next)) {
      clearGameSession(memoTestId);
      onFinish(calculateScore(next));
    }
  }

  return {
    cards: game.cards,
    retries: game.retries,
    matchedPairs: game.matchedPairs,
    totalPairs: memoTest.images.length,
    locked,
    announcement,
    flip,
  };
}
