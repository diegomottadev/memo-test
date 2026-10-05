import PropTypes from 'prop-types';
import Button from '../Button';
import Text from '../Text';
import { memoTestSummaryShape } from '../../types/propTypes';
import styles from './MemoTestItem.module.css';

/**
 * One memo test of the home list. The button's accessible name adds the memo
 * test name ("Start Animals"), so screen readers do not hear many buttons that
 * all say "Start". It starts with the visible text, as WCAG 2.5.3 asks.
 *
 * @param {object} props
 * @param {import('../../api/memoTestApi').MemoTestSummary} props.memoTest
 * @param {boolean} props.hasActiveSession - Shows "Continue" instead of "Start".
 * @param {boolean} [props.isPending] - A session for this memo test is being created.
 * @param {boolean} [props.disabled]
 * @param {(memoTest: object) => void} props.onSelect
 */
export default function MemoTestItem({
  memoTest,
  hasActiveSession,
  isPending = false,
  disabled,
  onSelect,
}) {
  const label = isPending ? 'Creating game…' : hasActiveSession ? 'Continue' : 'Start';

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <Text as="h2" variant="heading">
          {memoTest.name}
        </Text>
        {memoTest.maxScore !== null && (
          <Text variant="accent">Best score: {memoTest.maxScore}</Text>
        )}
      </div>
      <Button
        variant={hasActiveSession ? 'secondary' : 'primary'}
        disabled={disabled}
        aria-busy={isPending}
        aria-label={`${label} ${memoTest.name}`}
        onClick={() => onSelect(memoTest)}
      >
        {label}
      </Button>
    </li>
  );
}

MemoTestItem.propTypes = {
  memoTest: memoTestSummaryShape.isRequired,
  hasActiveSession: PropTypes.bool.isRequired,
  isPending: PropTypes.bool,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};
