/**
 * Builds an inline SVG image so mocks work offline and without external hosts.
 *
 * @param {string} emoji - Character drawn in the middle of the card.
 * @param {string} background - SVG fill color (image content, not a UI token).
 * @returns {string} A `data:` URL.
 */
const emojiImage = (emoji, background) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect width="100" height="150" fill="${background}"/><text x="50" y="75" font-size="56" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`,
  )}`;

/**
 * Memo tests returned by the mock API, already in the same shape the UI uses.
 * Adding a memo test or an image here is enough for it to show up in the app.
 */
export const MOCK_MEMO_TESTS = [
  {
    id: '1',
    name: 'Animals',
    images: [
      { id: '1', url: emojiImage('🐶', '#fde68a'), label: 'Dog' },
      { id: '2', url: emojiImage('🐱', '#fbcfe8'), label: 'Cat' },
      { id: '3', url: emojiImage('🦊', '#bfdbfe'), label: 'Fox' },
      { id: '4', url: emojiImage('🐸', '#bbf7d0'), label: 'Frog' },
    ],
  },
  {
    id: '2',
    name: 'Food',
    images: [
      { id: '5', url: emojiImage('🍕', '#fed7aa'), label: 'Pizza' },
      { id: '6', url: emojiImage('🥐', '#e9d5ff'), label: 'Croissant' },
      { id: '7', url: emojiImage('🍩', '#fecaca'), label: 'Donut' },
      { id: '8', url: emojiImage('🍎', '#d9f99d'), label: 'Apple' },
    ],
  },
];
