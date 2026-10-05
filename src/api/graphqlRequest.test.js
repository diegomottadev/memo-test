import { describe, expect, it, vi } from 'vitest';
import { ApiError, graphqlRequest, isUnavailableError } from './graphqlRequest';

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

const request = (fetchImpl, options = {}) =>
  graphqlRequest(
    'query Q { ok }',
    { id: 1 },
    { baseUrl: 'http://api/graphql', fetchImpl, ...options },
  );

describe('graphqlRequest', () => {
  it('sends a POST with the query and variables, and returns data', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }));

    await expect(request(fetchImpl)).resolves.toEqual({ ok: true });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/graphql');
    expect(init.method).toBe('POST');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init.body)).toEqual({ query: 'query Q { ok }', variables: { id: 1 } });
  });

  it('keeps the GraphQL errors as a normal (available) error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ errors: [{ message: 'boom' }] }));
    const error = await request(fetchImpl).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('boom');
    expect(isUnavailableError(error)).toBe(false);
  });

  it.each([
    ['a network error', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['an HTTP error', () => Promise.resolve(jsonResponse({}, { ok: false, status: 503 }))],
    [
      'an answer that is not JSON',
      () =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new SyntaxError('<')),
        }),
    ],
  ])('marks %s as "server not available"', async (_, fetchResult) => {
    const error = await request(vi.fn(fetchResult)).catch((e) => e);
    expect(isUnavailableError(error)).toBe(true);
  });

  it('marks a slow server as "not available" after the timeout', async () => {
    // Never answers, but stops when the request signal is aborted.
    const fetchImpl = vi.fn(
      (_, { signal }) =>
        new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason))),
    );
    const error = await request(fetchImpl, { timeoutMs: 10 }).catch((e) => e);

    expect(isUnavailableError(error)).toBe(true);
    expect(error.message).toBe('The server did not answer in time');
  });

  it('keeps a cancellation by the caller as an AbortError', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn(
      (_, { signal }) =>
        new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason))),
    );
    const promise = request(fetchImpl, { signal: controller.signal });
    controller.abort();

    const error = await promise.catch((e) => e);
    expect(error.name).toBe('AbortError');
    expect(isUnavailableError(error)).toBe(false);
  });
});
