import { describe, expect, it, vi } from 'vitest';
import { createGameSession, getMemoTest, getMemoTests } from './memoTestApi';

const respondWith = (data) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ data }) });

describe('memoTestApi', () => {
  it('normalizes the list of memo tests', async () => {
    const fetchImpl = respondWith({
      memoTests: [
        { id: 1, name: 'A', scoreMax: { score: 80 } },
        { id: 2, name: 'B', scoreMax: null },
      ],
    });
    await expect(getMemoTests({ baseUrl: 'x', fetchImpl })).resolves.toEqual([
      { id: '1', name: 'A', maxScore: 80 },
      { id: '2', name: 'B', maxScore: null },
    ]);
  });

  it('normalizes images and returns null when the memo test does not exist', async () => {
    const found = respondWith({
      memoTest: { id: 1, name: 'A', images: [{ id: 3, image_url: 'u' }] },
    });
    await expect(getMemoTest({ id: '1', baseUrl: 'x', fetchImpl: found })).resolves.toEqual({
      id: '1',
      name: 'A',
      images: [{ id: '3', url: 'u', label: 'Picture 1' }],
    });
    await expect(
      getMemoTest({ id: '9', baseUrl: 'x', fetchImpl: respondWith({ memoTest: null }) }),
    ).resolves.toBeNull();
  });

  it('creates the session with 0 pairs found and state Started', async () => {
    const fetchImpl = respondWith({ createGameSession: { id: 7 } });
    await expect(createGameSession({ memoTestId: '1', baseUrl: 'x', fetchImpl })).resolves.toEqual({
      id: '7',
    });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).variables).toEqual({
      memo_test_id: '1',
      retries: 0,
      number_of_pairs: 0,
      state: 'Started',
    });
  });
});
