import PropTypes from 'prop-types';
import styles from './Button.module.css';

const variants = {
  primary: styles.primary,
  secondary: styles.secondary,
};

/**
 * Button with visual variants. Renders a `<button>` by default; pass
 * `as={Link}` (plus `to`) when the action navigates, so it is a real link.
 *
 * @param {object} props
 * @param {keyof variants} [props.variant='primary']
 * @param {import('react').ElementType} [props.as='button'] - Element or component to render.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Only applied to `<button>`.
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  as: Element = 'button',
  type = 'button',
  className = '',
  ...props
}) {
  const elementProps = Element === 'button' ? { type, ...props } : props;
  return (
    <Element className={`${styles.button} ${variants[variant]} ${className}`} {...elementProps} />
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variants)),
  as: PropTypes.elementType,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
