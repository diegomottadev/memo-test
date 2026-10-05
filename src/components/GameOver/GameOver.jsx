import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { ROUTES } from '../../constants/routes';
import useFocusOnMount from '../../hooks/useFocusOnMount';
import pageTitle from '../../utils/pageTitle';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';
import Text from '../Text';
import styles from './GameOver.module.css';

const SAVE_MESSAGES = {
  idle: '',
  saving: 'Saving score…',
  saved: 'Score saved.',
};

/**
 * End-of-game screen. It replaces the board, so focus moves to its heading;
 * otherwise keyboard and screen reader users would be left on a removed card.
 *
 * @param {object} props
 * @param {number} props.score
 * @param {'idle'|'saving'|'saved'|'error'} props.saveStatus - Status of the score request.
 * @param {() => void} props.onRetrySave
 */
export default function GameOver({ score, saveStatus, onRetrySave }) {
  const headingRef = useFocusOnMount();

  return (
    <section className={styles.gameOver} aria-labelledby="game-over-title">
      <title>{pageTitle('Well done!')}</title>
      <Text as="h1" variant="title" id="game-over-title" tabIndex={-1} ref={headingRef}>
        Well done!
      </Text>
      <Text variant="accent" className={styles.score}>
        Score: {score}
      </Text>
      {saveStatus === 'error' ? (
        <ErrorMessage message="Could not save the score." onRetry={onRetrySave} />
      ) : (
        <Text variant="muted" role="status">
          {SAVE_MESSAGES[saveStatus]}
        </Text>
      )}
      <Button as={Link} to={ROUTES.HOME}>
        Back to home
      </Button>
    </section>
  );
}

GameOver.propTypes = {
  score: PropTypes.number.isRequired,
  saveStatus: PropTypes.oneOf(['idle', 'saving', 'saved', 'error']).isRequired,
  onRetrySave: PropTypes.func.isRequired,
};
