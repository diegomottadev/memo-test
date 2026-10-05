import PropTypes from 'prop-types';
import Text from '../Text';
import styles from './EmptyState.module.css';

/**
 * Placeholder shown when a request succeeds but returns nothing to display.
 *
 * @param {object} props
 * @param {string} props.message - Text in the UI language.
 */
export default function EmptyState({ message }) {
  return (
    <div className={styles.empty}>
      <Text variant="muted">{message}</Text>
    </div>
  );
}

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};
