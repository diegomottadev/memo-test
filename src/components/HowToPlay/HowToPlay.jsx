import PropTypes from 'prop-types';
import { HOW_TO_PLAY_STEPS } from '../../constants/howToPlay';
import styles from './HowToPlay.module.css';

/**
 * Help box that explains the rules of the game. It uses `<details>`, so users
 * can open and close it with the mouse or the keyboard without extra code.
 *
 * @param {object} props
 * @param {boolean} [props.defaultOpen=false] - Show the steps when the page loads.
 */
export default function HowToPlay({ defaultOpen = false }) {
  return (
    <details className={styles.box} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.icon} aria-hidden="true">
          i
        </span>
        How to play
      </summary>
      <ol className={styles.steps}>
        {HOW_TO_PLAY_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </details>
  );
}

HowToPlay.propTypes = {
  defaultOpen: PropTypes.bool,
};
