import { useEffect, useRef } from 'react';

/**
 * Moves keyboard and screen reader focus to an element when it mounts. Used
 * when the content the user was interacting with disappears (e.g. the board is
 * replaced by the game over screen). The target needs `tabIndex={-1}`.
 *
 * @returns {import('react').RefObject<HTMLElement>} Ref to attach to the target.
 */
export default function useFocusOnMount() {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
