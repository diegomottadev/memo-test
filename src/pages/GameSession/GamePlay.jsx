import PropTypes from 'prop-types';
import CardGrid from '../../components/CardGrid';
import GameStats from '../../components/GameStats';
import HowToPlay from '../../components/HowToPlay';
import useMemoGame from '../../hooks/useMemoGame';
import { memoTestShape } from '../../types/propTypes';
import styles from './GameSession.module.css';

/**
 * Stateful part of the game page. It mounts only once the memo test is loaded,
 * so the initial game (new or resumed) is computed exactly once.
 *
 * @param {object} props
 * @param {import('../../api/memoTestApi').MemoTest} props.memoTest
 * @param {string} props.sessionId
 * @param {boolean} props.resume - Restore the saved game instead of dealing a new one.
 * @param {(score: number) => void} props.onFinish
 */
export default function GamePlay({ memoTest, sessionId, resume, onFinish }) {
  const { cards, retries, matchedPairs, totalPairs, locked, announcement, flip } = useMemoGame({
    memoTest,
    sessionId,
    resume,
    onFinish,
  });

  return (
    <div className={styles.play}>
      <GameStats matchedPairs={matchedPairs} totalPairs={totalPairs} retries={retries} />
      {/* Live region: always mounted so screen readers pick up every change. */}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      <CardGrid cards={cards} disabled={locked} onFlip={flip} />
      <HowToPlay />
    </div>
  );
}

GamePlay.propTypes = {
  memoTest: memoTestShape.isRequired,
  sessionId: PropTypes.string.isRequired,
  resume: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
};
