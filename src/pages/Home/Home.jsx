import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api';
import ErrorMessage from '../../components/ErrorMessage';
import HowToPlay from '../../components/HowToPlay';
import MemoTestList from '../../components/MemoTestList';
import MemoTestListSkeleton from '../../components/MemoTestListSkeleton';
import Text from '../../components/Text';
import { buildGameSessionPath, SESSION_ACTIONS } from '../../constants/routes';
import withAsyncState from '../../hocs/withAsyncState';
import useAsync from '../../hooks/useAsync';
import useAsyncAction from '../../hooks/useAsyncAction';
import { loadActiveSessions, saveActiveSession } from '../../utils/gameStorage';
import pageTitle from '../../utils/pageTitle';
import styles from './Home.module.css';

const MemoTestListWithState = withAsyncState(MemoTestList, {
  dataProp: 'memoTests',
  LoadingComponent: MemoTestListSkeleton,
  emptyMessage: 'There are no memo tests to play yet.',
  errorMessage: 'Could not load the memo tests.',
});

// Defined outside the component so `useAsyncAction` gets a stable function.
const createSessionRequest = (memoTestId) => api.createGameSession({ memoTestId });

/**
 * Home page: lists memo tests and starts or resumes a game.
 *
 * Unfinished sessions are read from localStorage once, on mount. Starting a
 * new game creates a session first and only then navigates to the board.
 */
export default function Home() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync((signal) => api.getMemoTests({ signal }));
  const [activeSessions] = useState(loadActiveSessions);
  const [selected, setSelected] = useState(null);
  const createSession = useAsyncAction(createSessionRequest);

  async function handleSelect(memoTest) {
    const activeSessionId = activeSessions[memoTest.id];
    if (activeSessionId) {
      navigate(buildGameSessionPath(memoTest.id, activeSessionId, SESSION_ACTIONS.CONTINUE));
      return;
    }

    setSelected(memoTest);
    const session = await createSession.run(memoTest.id);
    if (session) {
      saveActiveSession(memoTest.id, session.id);
      navigate(buildGameSessionPath(memoTest.id, session.id, SESSION_ACTIONS.NEW));
    }
  }

  return (
    <div className={styles.home}>
      <title>{pageTitle()}</title>
      <Text as="h1" variant="title">
        Choose a memo test
      </Text>
      <HowToPlay defaultOpen />
      {createSession.error && selected && (
        <ErrorMessage
          message={`Could not start "${selected.name}".`}
          onRetry={() => handleSelect(selected)}
        />
      )}
      <MemoTestListWithState
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        activeSessions={activeSessions}
        pendingId={createSession.pending ? selected?.id : null}
        onSelect={handleSelect}
      />
    </div>
  );
}
