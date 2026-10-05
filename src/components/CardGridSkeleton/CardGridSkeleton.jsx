import PropTypes from 'prop-types';
import Skeleton from '../Skeleton';
import styles from './CardGridSkeleton.module.css';

/**
 * Loading state of the game board, shaped like `CardGrid`. Announced as a
 * status region.
 *
 * @param {object} props
 * @param {number} [props.count=8] - Placeholder cards.
 */
export default function CardGridSkeleton({ count = 8 }) {
  return (
    <div role="status" aria-busy="true" className={styles.wrapper}>
      <span className="visually-hidden">Loading board…</span>
      <ul className={styles.grid}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <Skeleton variant="card" />
          </li>
        ))}
      </ul>
    </div>
  );
}

CardGridSkeleton.propTypes = {
  count: PropTypes.number,
};
