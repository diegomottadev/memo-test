import PropTypes from 'prop-types';
import Button from '../Button';
import Text from '../Text';
import styles from './ErrorMessage.module.css';

/**
 * Error box announced to screen readers as soon as it appears (`role="alert"`).
 *
 * @param {object} props
 * @param {string} props.message - Text in the UI language.
 * @param {() => void} [props.onRetry] - If set, shows a "Try again" button.
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <Text variant="error">{message}</Text>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};
