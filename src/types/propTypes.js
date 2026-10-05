import PropTypes from 'prop-types';

/**
 * PropTypes for the UI model returned by `src/api`. React 19 no longer checks
 * propTypes at runtime; ESLint (`react/prop-types`) validates their usage.
 */

/** Memo test as listed on the home page. */
export const memoTestSummaryShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  maxScore: PropTypes.number,
});

/** Image of a memo test. */
export const imageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

/** Memo test with the images needed to play it. */
export const memoTestShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(imageShape).isRequired,
});

/** Card on the board; two cards share each `imageId`. */
export const cardShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  imageId: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  imageLabel: PropTypes.string.isRequired,
  isFlipped: PropTypes.bool.isRequired,
  isMatched: PropTypes.bool.isRequired,
});
