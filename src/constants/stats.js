/**
 * Stats shown above the board. Adding a stat means adding an object; `GameStats`
 * renders each `value(stats)` next to its label.
 *
 * @type {Array<{ key: string, label: string, value: (stats: { matchedPairs: number, totalPairs: number, retries: number }) => string }>}
 */
export const GAME_STATS = [
  {
    key: 'pairs',
    label: 'Pairs',
    value: ({ matchedPairs, totalPairs }) => `${matchedPairs} of ${totalPairs}`,
  },
  {
    key: 'retries',
    label: 'Tries',
    value: ({ retries }) => String(retries),
  },
];
