import { vi } from 'vitest';

/**
 * Builds a fake of the `src/api` module where every function is a `vi.fn`.
 * Use it inside `vi.mock('<path>/api', ...)`.
 *
 * @returns {{ default: Record<string, import('vitest').Mock> }}
 */
export function createApiMock() {
  return {
    default: {
      getMemoTests: vi.fn(),
      getMemoTest: vi.fn(),
      createGameSession: vi.fn(),
      updateGameSessionProgress: vi.fn(() => Promise.resolve()),
      finishGameSession: vi.fn(() => Promise.resolve()),
      getDataSource: vi.fn(() => 'server'),
      subscribeDataSource: vi.fn(() => () => {}),
    },
  };
}

/** Memo test with two images (4 cards), used by page tests. */
export const MEMO_TEST = {
  id: '1',
  name: 'Animals',
  images: [
    { id: '10', url: 'dog.svg', label: 'Dog' },
    { id: '20', url: 'cat.svg', label: 'Cat' },
  ],
};
