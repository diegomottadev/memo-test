import PropTypes from 'prop-types';
import { GAME_STATS } from '../../constants/stats';
import styles from './GameStats.module.css';

/**
 * Game progress as a description list. Which stats appear is configured in
 * `constants/stats.js`.
 *
 * @param {object} props
 * @param {number} props.matchedPairs
 * @param {number} props.totalPairs
 * @param {number} props.retries
 */
export default function GameStats(stats) {
  return (
    <dl className={styles.stats}>
      {GAME_STATS.map((stat) => (
        <div key={stat.key} className={styles.stat}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>{stat.value(stats)}</dd>
        </div>
      ))}
    </dl>
  );
}

GameStats.propTypes = {
  matchedPairs: PropTypes.number.isRequired,
  totalPairs: PropTypes.number.isRequired,
  retries: PropTypes.number.isRequired,
};
