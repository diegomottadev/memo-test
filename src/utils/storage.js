/**
 * localStorage helpers that never throw. Storage can be unavailable (private
 * mode, blocked cookies, full quota) or hold corrupted JSON; in those cases the
 * game keeps working, it just cannot be resumed later.
 */

/**
 * @param {string} key
 * @param {*} [fallback=null] - Returned when the key is missing or unreadable.
 * @returns {*} The parsed value.
 */
export function readJson(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {*} value - Any JSON-serializable value.
 */
export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignored on purpose: see the comment at the top of this file.
  }
}

/**
 * @param {...string} keys
 */
export function removeKeys(...keys) {
  try {
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignored on purpose: see the comment at the top of this file.
  }
}

/**
 * @returns {string[]} Every key currently stored, or an empty list if storage is unavailable.
 */
export function listKeys() {
  try {
    // `Object.keys(localStorage)` misses items whose name is also a Storage
    // method (for example "key"), so we use the official API.
    const { localStorage } = window;
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
  } catch {
    return [];
  }
}
