import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks a user-triggered write (create a session, save a score).
 *
 * Unlike `useAsync`, it does not cancel the request: when a write is already
 * sent, it must finish even if the user leaves the screen. It only stops
 * changing state after the component is removed.
 *
 * @template T
 * @param {(...args: any[]) => Promise<T>} asyncFn
 * @returns {{
 *   run: (...args: any[]) => Promise<T|true|null>,
 *   pending: boolean,
 *   error: Error|null,
 *   done: boolean,
 *   reset: () => void,
 * }} `run` resolves to the result (`true` for void results), or to `null` when
 *   it failed or the component was unmounted.
 */
export default function useAsyncAction(asyncFn) {
  const [state, setState] = useState({ pending: false, error: null, done: false });
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setState({ pending: true, error: null, done: false });
      try {
        const result = await asyncFn(...args);
        if (!mounted.current) return null;
        setState({ pending: false, error: null, done: true });
        return result ?? true;
      } catch (error) {
        console.error(error);
        if (mounted.current) setState({ pending: false, error, done: false });
        return null;
      }
    },
    [asyncFn],
  );

  const reset = useCallback(() => setState({ pending: false, error: null, done: false }), []);

  return { ...state, run, reset };
}
