import { useState } from 'react';
import { Link, useParams } from 'react-router';
import api from '../../api';
import Button from '../../components/Button';
import CardGridSkeleton from '../../components/CardGridSkeleton';
import GameOver from '../../components/GameOver';
import Text from '../../components/Text';
import { ROUTES, SESSION_ACTIONS } from '../../constants/routes';
import withAsyncState from '../../hocs/withAsyncState';
import useAsync from '../../hooks/useAsync';
import useAsyncAction from '../../hooks/useAsyncAction';
import pageTitle from '../../utils/pageTitle';
import GamePlay from './GamePlay';
import styles from './GameSession.module.css';

const GamePlayWithState = withAsyncState(GamePlay, {
  dataProp: 'memoTest',
  LoadingComponent: CardGridSkeleton,
  isEmpty: (memoTest) => !memoTest || memoTest.images.length === 0,
  emptyMessage: 'This memo test does not exist or has no pictures.',
  errorMessage: 'Could not load the memo test.',
});

/**
 * Maps the state of the save request to the status shown by `GameOver`.
 *
 * @param {{ pending: boolean, error: Error|null, done: boolean }} action
 * @returns {'idle'|'saving'|'saved'|'error'}
 */
function getSaveStatus({ pending, error, done }) {
  if (error) return 'error';
  if (done) return 'saved';
  return pending ? 'saving' : 'idle';
}

/**
 * @param {{ data?: object, loading: boolean }} request
 * @returns {string} Heading of the page while the memo test loads or fails.
 */
function getHeading({ data, loading }) {
  if (data) return data.name;
  return loading ? 'Loading game…' : 'Game';
}

/**
 * Game page (`/game/:gameId/session/:sessionId/:action`). Loads the memo test,
 * renders the board and, when the game ends, saves the score and shows
 * `GameOver`. When `action` is "continue", it resumes the saved game.
 */
export default function GameSession() {
  const { gameId, sessionId, action } = useParams();
  const [score, setScore] = useState(null);
  const request = useAsync((signal) => api.getMemoTest({ id: gameId, signal }), [gameId]);
  const saveScore = useAsyncAction((finalScore) =>
    api.finishGameSession({ id: sessionId, memoTestId: gameId, score: finalScore }),
  );

  function handleFinish(finalScore) {
    setScore(finalScore);
    saveScore.run(finalScore);
  }

  if (score !== null) {
    return (
      <GameOver
        score={score}
        saveStatus={getSaveStatus(saveScore)}
        onRetrySave={() => saveScore.run(score)}
      />
    );
  }

  const heading = getHeading(request);

  return (
    <div className={styles.session}>
      <title>{pageTitle(heading)}</title>
      <Button as={Link} to={ROUTES.HOME} variant="secondary" className={styles.backButton}>
        Back to home
      </Button>
      <Text as="h1" variant="title">
        {heading}
      </Text>
      <GamePlayWithState
        // A new game or session must start from a fresh GamePlay state.
        key={`${gameId}-${sessionId}`}
        loading={request.loading}
        error={request.error}
        data={request.data}
        onRetry={request.refetch}
        sessionId={sessionId}
        resume={action === SESSION_ACTIONS.CONTINUE}
        onFinish={handleFinish}
      />
    </div>
  );
}
