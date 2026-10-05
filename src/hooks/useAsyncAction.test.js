import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useAsyncAction from './useAsyncAction';

describe('useAsyncAction', () => {
  it('is pending while running and done after it finishes', async () => {
    let resolve;
    const asyncFn = vi.fn(() => new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useAsyncAction(asyncFn));

    let promise;
    act(() => {
      promise = result.current.run('arg');
    });
    expect(result.current.pending).toBe(true);
    expect(asyncFn).toHaveBeenCalledWith('arg');

    await act(async () => resolve({ id: '1' }));
    await expect(promise).resolves.toEqual({ id: '1' });
    expect(result.current).toMatchObject({ pending: false, done: true, error: null });
  });

  it('returns true for actions without a result', async () => {
    const { result } = renderHook(() => useAsyncAction(() => Promise.resolve()));
    let value;
    await act(async () => {
      value = await result.current.run();
    });
    expect(value).toBe(true);
  });

  it('keeps the error and returns null when the action fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');
    const { result } = renderHook(() => useAsyncAction(() => Promise.reject(error)));

    let value;
    await act(async () => {
      value = await result.current.run();
    });

    expect(value).toBeNull();
    expect(result.current).toMatchObject({ pending: false, done: false, error });
  });

  it('returns null and does not change state after unmount', async () => {
    let resolve;
    const { result, unmount } = renderHook(() =>
      useAsyncAction(() => new Promise((r) => (resolve = r))),
    );

    let promise;
    act(() => {
      promise = result.current.run();
    });
    unmount();
    resolve('late');

    await expect(promise).resolves.toBeNull();
  });
});
