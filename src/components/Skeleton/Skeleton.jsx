import PropTypes from 'prop-types';
import styles from './Skeleton.module.css';

const variants = {
  title: styles.title,
  text: styles.text,
  button: styles.button,
  card: styles.card,
};

/**
 * Grey shape shown while content loads. Screen readers ignore it; the box
 * around the skeletons tells them that the page is loading.
 *
 * @param {object} props
 * @param {keyof variants} [props.variant='text'] - Shape to imitate.
 * @param {string} [props.className]
 */
export default function Skeleton({ variant = 'text', className = '' }) {
  return (
    <span aria-hidden="true" className={`${styles.skeleton} ${variants[variant]} ${className}`} />
  );
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variants)),
  className: PropTypes.string,
};
