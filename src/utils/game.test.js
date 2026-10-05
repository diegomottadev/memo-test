import { describe, expect, it } from 'vitest';
import {
  calculateScore,
  describeFlip,
  createDeck,
  createGame,
  flipCard,
  hideSelected,
  isBoardLocked,
  isGameComplete,
  restoreGame,
  shuffle,
} from './game';

const images = [
  { id: '1', url: 'a.png' },
  { id: '2', url: 'b.png' },
];
// With j === i on every step, Fisher-Yates keeps the original order.
const noShuffle = () => 0.999999;

const orderedGame = () => createGame(images, noShuffle);

describe('shuffle', () => {
  it('does not change the original array and keeps all items', () => {
    const input = [1, 2, 3, 4];
    const result = shuffle(input, () => 0);
    expect(input).toEqual([1, 2, 3, 4]);
    expect([...result].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('createDeck', () => {
  it('creates two cards per image with unique ids', () => {
    const deck = createDeck(images, noShuffle);
    expect(deck.map((card) => card.id)).toEqual(['1-0', '1-1', '2-0', '2-1']);
    expect(deck.every((card) => !card.isFlipped && !card.isMatched)).toBe(true);
  });
});

describe('flipCard', () => {
  it('turns a card over and counts the click', () => {
    const next = flipCard(orderedGame(), '1-0');
    expect(next.cards[0].isFlipped).toBe(true);
    expect(next.retries).toBe(1);
    expect(next.selectedIds).toEqual(['1-0']);
  });

  it('marks the pair when the two cards match', () => {
    const next = flipCard(flipCard(orderedGame(), '1-0'), '1-1');
    expect(next.cards.slice(0, 2).every((card) => card.isMatched)).toBe(true);
    expect(next.matchedPairs).toBe(1);
    expect(next.selectedIds).toEqual([]);
  });

  it('locks the board when the cards do not match', () => {
    const next = flipCard(flipCard(orderedGame(), '1-0'), '2-0');
    expect(isBoardLocked(next)).toBe(true);
    expect(flipCard(next, '2-1')).toBe(next);
  });

  it('ignores clicks on face-up or unknown cards', () => {
    const game = flipCard(orderedGame(), '1-0');
    expect(flipCard(game, '1-0')).toBe(game);
    expect(flipCard(game, 'nope')).toBe(game);
  });
});

describe('hideSelected', () => {
  it('turns back the cards without a pair and unlocks the board', () => {
    const locked = flipCard(flipCard(orderedGame(), '1-0'), '2-0');
    const next = hideSelected(locked);
    expect(next.cards.every((card) => !card.isFlipped)).toBe(true);
    expect(isBoardLocked(next)).toBe(false);
    expect(next.retries).toBe(2);
  });
});

describe('isGameComplete and calculateScore', () => {
  it('a perfect game scores 100', () => {
    const game = ['1-0', '1-1', '2-0', '2-1'].reduce(flipCard, orderedGame());
    expect(isGameComplete(game)).toBe(true);
    expect(calculateScore(game)).toBe(100);
  });

  it('the score goes down with failed tries', () => {
    expect(calculateScore({ cards: new Array(8), retries: 12 })).toBe(66);
    expect(calculateScore({ cards: new Array(8), retries: 0 })).toBe(0);
  });
});

describe('restoreGame', () => {
  it('restores found pairs and tries, and hides cards without a pair', () => {
    const played = flipCard(['1-0', '1-1'].reduce(flipCard, orderedGame()), '2-0');
    const restored = restoreGame(JSON.parse(JSON.stringify(played)), images);
    expect(restored.retries).toBe(3);
    expect(restored.matchedPairs).toBe(1);
    expect(restored.cards.find((card) => card.id === '2-0').isFlipped).toBe(false);
    expect(restored.selectedIds).toEqual([]);
  });

  it('ignores saved games that do not match the images', () => {
    expect(restoreGame(null, images)).toBeNull();
    expect(restoreGame({ cards: [] }, images)).toBeNull();
    const other = createGame([
      { id: '9', url: 'x' },
      { id: '8', url: 'y' },
    ]);
    expect(restoreGame(other, images)).toBeNull();
  });
});

describe('describeFlip', () => {
  const labelled = [
    { id: '1', url: 'a.png', label: 'Dog' },
    { id: '2', url: 'b.png', label: 'Cat' },
  ];
  const game = () => createGame(labelled, noShuffle);

  it('names the first card of a turn', () => {
    const previous = game();
    const next = flipCard(previous, '2-0');
    expect(describeFlip(previous, next, '2-0')).toBe('Card 3: Cat.');
  });

  it('announces a found pair', () => {
    const previous = flipCard(game(), '1-0');
    const next = flipCard(previous, '1-1');
    expect(describeFlip(previous, next, '1-1')).toBe('Pair found! Dog.');
  });

  it('announces two different cards', () => {
    const previous = flipCard(game(), '1-0');
    const next = flipCard(previous, '2-0');
    expect(describeFlip(previous, next, '2-0')).toBe('No match: Dog and Cat.');
  });
});
