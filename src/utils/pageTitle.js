import { APP_NAME } from '../constants/config';

/**
 * Builds a document title such as "Animals · Memo Test".
 *
 * @param {string} [page] - Page-specific part; omit it for the home page.
 * @returns {string}
 */
export default function pageTitle(page) {
  return page ? `${page} · ${APP_NAME}` : APP_NAME;
}
