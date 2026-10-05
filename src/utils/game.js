/**
 * Game rules as pure functions. Each one takes a game state and returns a new
 * state, or the very same object when the action does not apply, so callers can
 * detect no-ops with `next === game`.
 *
 * @typedef {object} Card
 * @property {string} id - Unique per card: `${imageId}-${copy}`.
 * @property {string} imageId - Shared by the two cards of a pair.
 * @property {string} imageUrl
 * @property {string} imageLabel - Accessible name of the image.
 * @property {boolean} isFlipped - Face up because it was just clicked.
 * @property {boolean} isMatched - Face up for good because its pair was found.
 *
 * @typedef {object} Game
 * @property {Card[]} cards - In board order.
 * @property {string[]} selectedIds - Face-up cards not matched yet (0 to 2).
 * @property {number} retries - Every card click counts as one.
 * @property {number} matchedPairs
 */

/**
 * Fisher-Yates shuffle.
 *
 * @template T
 * @param {T[]} items - Not mutated.
 * @param {() => number} [random=Math.random] - Injectable for deterministic tests.
 * @returns {T[]} A new shuffled array.
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates two face-down cards per image, shuffled.
 *
 * @param {import('../api/memoTestApi').MemoTestImage[]} images
 * @param {() => number} [random=Math.random]
 * @returns {Card[]}
 */
export function createDeck(images, random = Math.random) {
  const cards = images.flatMap((image) =>
    [0, 1].map((copy) => ({
      id: `${image.id}-${copy}`,
      imageId: image.id,
      imageUrl: image.url,
      imageLabel: image.label,
      isFlipped: false,
      isMatched: false,
    })),
  );
  return shuffle(cards, random);
}

/**
 * @param {import('../api/memoTestApi').MemoTestImage[]} images
 * @param {() => number} [random=Math.random]
 * @returns {Game} A new game with a shuffled deck.
 */
export function createGame(images, random = Math.random) {
  return { cards: createDeck(images, random), selectedIds: [], retries: 0, matchedPairs: 0 };
}

/**
 * Resumes a saved game if it belongs to the same images. Cards that were face
 * up without a pair are turned face down again; URLs and labels are refreshed
 * from `images` because they may have changed since the game was saved.
 *
 * @param {object|null} saved - Unvalidated value read from localStorage.
 * @param {import('../api/memoTestApi').MemoTestImage[]} images
 * @returns {Game|null} Null when there is nothing valid to resume.
 */
export function restoreGame(saved, images) {
  if (!saved || !Array.isArray(saved.cards) || saved.cards.length !== images.length * 2) {
    return null;
  }
  const imagesById = new Map(images.map((image) => [String(image.id), image]));
  if (!saved.cards.every((card) => imagesById.has(String(card.imageId)))) {
    return null;
  }
  return {
    cards: saved.cards.map((card) => {
      const image = imagesById.get(String(card.imageId));
      return { ...card, imageUrl: image.url, imageLabel: image.label, isFlipped: card.isMatched };
    }),
    selectedIds: [],
    retries: Number(saved.retries) || 0,
    matchedPairs: saved.cards.filter((card) => card.isMatched).length / 2,
  };
}

/**
 * While two non-matching cards are visible, the board ignores clicks.
 *
 * @param {Game} game
 * @returns {boolean}
 */
export const isBoardLocked = (game) => game.selectedIds.length === 2;

/**
 * @param {Game} game
 * @returns {boolean} True when every card is matched.
 */
export const isGameComplete = (game) => game.cards.every((card) => card.isMatched);

/**
 * Turns a card face up, counts the click and resolves the pair when it is the
 * second selected card.
 *
 * @param {Game} game
 * @param {string} cardId
 * @returns {Game} The same object when the click is ignored.
 */
export function flipCard(game, cardId) {
  if (isBoardLocked(game)) return game;
  const card = game.cards.find((candidate) => candidate.id === cardId);
  if (!card || card.isFlipped || card.isMatched) return game;

  const selectedIds = [...game.selectedIds, cardId];
  let cards = game.cards.map((candidate) =>
    candidate.id === cardId ? { ...candidate, isFlipped: true } : candidate,
  );
  const retries = game.retries + 1;

  if (selectedIds.length < 2) {
    return { ...game, cards, selectedIds, retries };
  }

  const [first, second] = selectedIds.map((id) => cards.find((candidate) => candidate.id === id));
  if (first.imageId !== second.imageId) {
    // Stays locked until `hideSelected` runs after FLIP_BACK_DELAY_MS.
    return { ...game, cards, selectedIds, retries };
  }

  cards = cards.map((candidate) =>
    selectedIds.includes(candidate.id) ? { ...candidate, isMatched: true } : candidate,
  );
  return { cards, selectedIds: [], retries, matchedPairs: game.matchedPairs + 1 };
}

/**
 * Turns the selected non-matching cards face down and unlocks the board.
 *
 * @param {Game} game
 * @returns {Game}
 */
export function hideSelected(game) {
  if (game.selectedIds.length === 0) return game;
  return {
    ...game,
    cards: game.cards.map((card) =>
      game.selectedIds.includes(card.id) && !card.isMatched ? { ...card, isFlipped: false } : card,
    ),
    selectedIds: [],
  };
}

/**
 * Score = cards / clicks * 100, truncated. A perfect game (each card clicked
 * exactly once) scores 100.
 *
 * @param {Pick<Game, 'cards' | 'retries'>} game
 * @returns {number}
 */
export function calculateScore({ cards, retries }) {
  if (retries <= 0) return 0;
  return Math.trunc((cards.length / retries) * 100);
}

/**
 * Describes the result of a click for screen readers, since a card changing
 * from face down to face up is not announced on its own.
 *
 * @param {Game} previous - State before `flipCard`.
 * @param {Game} next - State returned by `flipCard`.
 * @param {string} cardId - The clicked card.
 * @returns {string} Message for the user.
 */
export function describeFlip(previous, next, cardId) {
  const position = next.cards.findIndex((card) => card.id === cardId) + 1;
  const card = next.cards[position - 1];

  if (next.matchedPairs > previous.matchedPairs) {
    return `Pair found! ${card.imageLabel}.`;
  }
  if (isBoardLocked(next)) {
    const [first, second] = next.selectedIds.map((id) => next.cards.find((c) => c.id === id));
    return `No match: ${first.imageLabel} and ${second.imageLabel}.`;
  }
  return `Card ${position}: ${card.imageLabel}.`;
}
