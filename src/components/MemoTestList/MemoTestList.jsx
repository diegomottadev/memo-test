import PropTypes from 'prop-types';
import MemoTestItem from '../MemoTestItem';
import { memoTestSummaryShape } from '../../types/propTypes';
import styles from './MemoTestList.module.css';

/**
 * List of memo tests on the home page.
 *
 * @param {object} props
 * @param {import('../../api/memoTestApi').MemoTestSummary[]} props.memoTests
 * @param {Record<string, string>} props.activeSessions - Memo test id to unfinished session id.
 * @param {string|null} [props.pendingId] - Memo test whose session is being created;
 *   while set, every button is disabled.
 * @param {(memoTest: object) => void} props.onSelect
 */
export default function MemoTestList({ memoTests, activeSessions, pendingId = null, onSelect }) {
  return (
    <ul className={styles.list}>
      {memoTests.map((memoTest) => (
        <MemoTestItem
          key={memoTest.id}
          memoTest={memoTest}
          hasActiveSession={memoTest.id in activeSessions}
          isPending={memoTest.id === pendingId}
          disabled={pendingId !== null}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

MemoTestList.propTypes = {
  memoTests: PropTypes.arrayOf(memoTestSummaryShape).isRequired,
  activeSessions: PropTypes.objectOf(PropTypes.string).isRequired,
  pendingId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
