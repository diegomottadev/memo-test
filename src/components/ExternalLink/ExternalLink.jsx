import PropTypes from 'prop-types';
import styles from './ExternalLink.module.css';

/**
 * Link that opens in a new tab. `rel="noopener noreferrer"` keeps the new page
 * from reaching `window.opener`; the hidden text warns screen reader users.
 *
 * @param {object} props
 * @param {string} props.href - Absolute URL.
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export default function ExternalLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${className}`}
    >
      {children}
      {/* The space stays outside the span: some name algorithms drop leading spaces inside it. */}{' '}
      <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  );
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
