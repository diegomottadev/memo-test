import PropTypes from 'prop-types';
import styles from './Text.module.css';

const variants = {
  title: styles.title,
  heading: styles.heading,
  body: styles.body,
  muted: styles.muted,
  accent: styles.accent,
  error: styles.error,
};

/**
 * Text with style variants. The variant sets how it looks; `as` sets which
 * HTML element it is, so heading levels stay correct at any size.
 *
 * @param {object} props
 * @param {import('react').ElementType} [props.as='p'] - e.g. `h1`, `h2`, `span`.
 * @param {keyof variants} [props.variant='body']
 * @param {string} [props.className]
 * @param {import('react').Ref<HTMLElement>} [props.ref] - Forwarded (React 19 passes `ref` as a prop).
 * @param {import('react').ReactNode} [props.children]
 */
export default function Text({ as: Element = 'p', variant = 'body', className = '', ...props }) {
  return <Element className={`${variants[variant]} ${className}`} {...props} />;
}

Text.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(Object.keys(variants)),
  className: PropTypes.string,
  children: PropTypes.node,
};
