import PropTypes from 'prop-types';
import { cardShape } from '../../types/propTypes';
import styles from './Card.module.css';

/**
 * Name of a card for screen readers. The image has `alt=""` because the
 * button already says what it shows.
 *
 * @param {import('../../utils/game').Card} card
 * @param {number} position - 1-based position on the board.
 * @returns {string}
 */
function getCardLabel(card, position) {
  if (card.isMatched) return `Card ${position}: ${card.imageLabel}, pair found`;
  if (card.isFlipped) return `Card ${position}: ${card.imageLabel}`;
  return `Card ${position}, face down`;
}

/**
 * Memo card with two real faces: the back shows its position, the front its
 * image. The image is only in the page while the card is face up, so nobody
 * can find it in the DOM. Face-up cards use `aria-disabled` instead of `disabled` so they stay
 * focusable and keyboard navigation does not skip them.
 *
 * @param {object} props
 * @param {import('../../utils/game').Card} props.card
 * @param {number} props.position - 1-based position on the board.
 * @param {boolean} [props.disabled] - True while the board is locked.
 * @param {(cardId: string) => void} props.onFlip
 */
export default function Card({ card, position, disabled = false, onFlip }) {
  const isFaceUp = card.isFlipped || card.isMatched;

  const handleClick = () => {
    if (!disabled && !isFaceUp) onFlip(card.id);
  };

  return (
    <button
      type="button"
      className={`${styles.card} ${isFaceUp ? styles.faceUp : ''} ${card.isMatched ? styles.matched : ''}`}
      aria-label={getCardLabel(card, position)}
      aria-disabled={isFaceUp}
      onClick={handleClick}
    >
      <span className={styles.inner}>
        <span className={`${styles.face} ${styles.back}`} aria-hidden="true">
          {position}
        </span>
        <span className={`${styles.face} ${styles.front}`}>
          {isFaceUp && <img className={styles.image} src={card.imageUrl} alt="" />}
        </span>
      </span>
    </button>
  );
}

Card.propTypes = {
  card: cardShape.isRequired,
  position: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onFlip: PropTypes.func.isRequired,
};
