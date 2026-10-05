import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mockApi from './mockApi';

// Runs a mock API call and skips its fake network delay.
async function call(fn, params) {
  const promise = fn(params);
  await vi.advanceTimersByTimeAsync(300);
  return promise;
}

describe('mockApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists the memo tests without a best score at the start', async () => {
    const memoTests = await call(mockApi.getMemoTests);
    expect(memoTests.length).toBeGreaterThan(0);
    expect(memoTests.every((memoTest) => memoTest.maxScore === null)).toBe(true);
  });

  it('returns a memo test with labelled images, or null', async () => {
    const memoTest = await call(mockApi.getMemoTest, { id: '1' });
    expect(memoTest.images[0]).toEqual({ id: '1', url: expect.any(String), label: 'Dog' });
    expect(await call(mockApi.getMemoTest, { id: '999' })).toBeNull();
  });

  it('keeps sessions in localStorage and uses the best score', async () => {
    const first = await call(mockApi.createGameSession, { memoTestId: '1' });
    const second = await call(mockApi.createGameSession, { memoTestId: '1' });
    expect(second.id).not.toBe(first.id);

    await call(mockApi.finishGameSession, { id: first.id, score: 60 });
    await call(mockApi.finishGameSession, { id: second.id, score: 90 });

    const [animals] = await call(mockApi.getMemoTests);
    expect(animals.maxScore).toBe(90);
  });

  it('uses ids that cannot clash with server ids', async () => {
    const { id } = await call(mockApi.createGameSession, { memoTestId: '1' });
    expect(id).toMatch(/^mock-\d+$/);
  });

  it('creates an unknown session on the fly (game started on the server)', async () => {
    await call(mockApi.finishGameSession, { id: '42', memoTestId: '2', score: 70 });
    const memoTests = await call(mockApi.getMemoTests);
    expect(memoTests.find((memoTest) => memoTest.id === '2').maxScore).toBe(70);
  });

  it('stops early when the request is cancelled', async () => {
    const controller = new AbortController();
    const promise = mockApi.getMemoTests({ signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toThrow();
  });
});
