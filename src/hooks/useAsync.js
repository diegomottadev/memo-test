import { useCallback, useEffect, useEffectEvent, useState } from 'react';

/**
 * Runs an async read on mount and whenever `deps` change.
 *
 * The previous request is cancelled with an AbortController. This way state is
 * never set on a removed component, and an old response can never replace a
 * newer one.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} asyncFn - Receives the signal to forward to `src/api`.
 * @param {Array<string|number|boolean|null|undefined>} [deps=[]] - Primitive values that trigger a new request.
 * @returns {{ data: T|undefined, loading: boolean, error: Error|null, refetch: () => void }}
 */
export default function useAsync(asyncFn, deps = []) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = JSON.stringify([...deps, reloadCount]);
  const [result, setResult] = useState({ key: null, data: undefined, error: null });

  // The effect always calls the latest `asyncFn`, but does not run again when the function changes.
  const run = useEffectEvent((signal) => asyncFn(signal));

  useEffect(() => {
    const controller = new AbortController();
    run(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data: undefined, error });
      },
    );
    return () => controller.abort();
  }, [requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // `loading` is calculated (the saved result is from an older request) instead
  // of being set inside the effect, because React 19 hook rules do not allow that.
  const loading = result.key !== requestKey;
  return {
    data: loading ? undefined : result.data,
    loading,
    error: loading ? null : result.error,
    refetch,
  };
}
