import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useAsync from './useAsync';

describe('useAsync', () => {
  it('starts loading and then returns the data', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('data')));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('data');
    expect(result.current.error).toBeNull();
  });

  it('returns the error when the request fails', async () => {
    const error = new Error('boom');
    const { result } = renderHook(() => useAsync(() => Promise.reject(error)));

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.data).toBeUndefined();
  });

  it('runs the request again with refetch', async () => {
    const asyncFn = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const { result } = renderHook(() => useAsync(asyncFn));
    await waitFor(() => expect(result.current.data).toBe('first'));

    act(() => result.current.refetch());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toBe('second'));
  });

  it('cancels the request when the component unmounts', () => {
    let signal;
    const { unmount } = renderHook(() =>
      useAsync((s) => {
        signal = s;
        return new Promise(() => {});
      }),
    );

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('cancels the old request and ignores its answer when deps change', async () => {
    const resolvers = {};
    const signals = {};
    const { result, rerender } = renderHook(
      ({ id }) =>
        useAsync(
          (signal) =>
            new Promise((resolve) => {
              resolvers[id] = resolve;
              signals[id] = signal;
            }),
          [id],
        ),
      { initialProps: { id: 'a' } },
    );

    rerender({ id: 'b' });
    expect(signals.a.aborted).toBe(true);

    await act(async () => resolvers.a('old'));
    expect(result.current.loading).toBe(true);

    await act(async () => resolvers.b('new'));
    expect(result.current.data).toBe('new');
  });
});
