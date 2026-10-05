import PropTypes from 'prop-types';
import Card from '../Card';
import { cardShape } from '../../types/propTypes';
import styles from './CardGrid.module.css';

/**
 * Board of cards as a list, so screen readers announce how many cards there are.
 *
 * @param {object} props
 * @param {import('../../utils/game').Card[]} props.cards - In board order.
 * @param {boolean} [props.disabled] - True while the board is locked.
 * @param {(cardId: string) => void} props.onFlip
 */
export default function CardGrid({ cards, disabled = false, onFlip }) {
  return (
    <ul className={styles.grid} aria-label="Board">
      {cards.map((card, index) => (
        <li key={card.id}>
          <Card card={card} position={index + 1} disabled={disabled} onFlip={onFlip} />
        </li>
      ))}
    </ul>
  );
}

CardGrid.propTypes = {
  cards: PropTypes.arrayOf(cardShape).isRequired,
  disabled: PropTypes.bool,
  onFlip: PropTypes.func.isRequired,
};
