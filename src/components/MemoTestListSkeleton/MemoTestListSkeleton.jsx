import PropTypes from 'prop-types';
import Skeleton from '../Skeleton';
import styles from './MemoTestListSkeleton.module.css';

/**
 * Loading state of `MemoTestList`, with the same layout to avoid a jump when
 * data arrives. Announced as a status region.
 *
 * @param {object} props
 * @param {number} [props.count=3] - Placeholder rows.
 */
export default function MemoTestListSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-busy="true">
      <span className="visually-hidden">Loading memo tests…</span>
      <ul className={styles.list}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.info}>
              <Skeleton variant="title" />
              <Skeleton variant="text" />
            </div>
            <Skeleton variant="button" />
          </li>
        ))}
      </ul>
    </div>
  );
}

MemoTestListSkeleton.propTypes = {
  count: PropTypes.number,
};
