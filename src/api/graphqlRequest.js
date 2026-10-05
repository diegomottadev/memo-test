import { API_URL, REQUEST_TIMEOUT_MS } from '../constants/config';

/**
 * Error raised by the API layer.
 *
 * `unavailable` is true when the server could not be used at all (no network,
 * no answer in time, an HTTP error or an answer that is not JSON). In that case
 * the app can switch to the mocks. GraphQL errors are real answers from the
 * server, so they are not `unavailable`.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Error message.
   * @param {object} [details]
   * @param {number} [details.status] - HTTP status of the response, if any.
   * @param {Array<object>} [details.errors] - GraphQL `errors` array, if any.
   * @param {boolean} [details.unavailable=false] - The server did not answer correctly.
   * @param {unknown} [details.cause] - Original error.
   */
  constructor(message, { status, errors, unavailable = false, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.unavailable = unavailable;
  }
}

/**
 * @param {unknown} error
 * @returns {boolean} True when the error means "the server is not available".
 */
export const isUnavailableError = (error) => error instanceof ApiError && error.unavailable;

// Wrapped so `fetch` is always called with the right `this` (avoids "Illegal invocation").
const defaultFetch = (...args) => globalThis.fetch(...args);

/**
 * Sends a GraphQL operation. This is the only place in the app that calls `fetch`.
 *
 * @param {string} query - GraphQL query or mutation document.
 * @param {object} [variables={}] - Operation variables.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - Cancels the request (e.g. on unmount).
 * @param {string} [options.baseUrl=API_URL] - GraphQL endpoint; can be changed in tests.
 * @param {typeof fetch} [options.fetchImpl] - `fetch` implementation; can be changed in tests.
 * @param {number} [options.timeoutMs=REQUEST_TIMEOUT_MS] - Maximum wait for an answer.
 * @returns {Promise<object>} The `data` field of the GraphQL response.
 * @throws {ApiError} With `unavailable: true` when the server cannot be used,
 *   or with the GraphQL errors when the server answered with errors.
 * @throws {DOMException} `AbortError` when the caller cancels with `signal`.
 */
export async function graphqlRequest(
  query,
  variables = {},
  { signal, baseUrl = API_URL, fetchImpl = defaultFetch, timeoutMs = REQUEST_TIMEOUT_MS } = {},
) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response;
  try {
    response = await fetchImpl(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: requestSignal,
    });
  } catch (error) {
    // Cancelled by the caller: not a server problem, so keep the original error.
    if (signal?.aborted) throw error;
    const message = timeout.aborted
      ? 'The server did not answer in time'
      : 'Could not connect to the server';
    throw new ApiError(message, { unavailable: true, cause: error });
  }

  if (!response.ok) {
    throw new ApiError(`The server answered with status ${response.status}`, {
      status: response.status,
      unavailable: true,
    });
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    // For example an HTML page: the URL is not a GraphQL server.
    throw new ApiError('The server answer is not valid JSON', {
      status: response.status,
      unavailable: true,
      cause: error,
    });
  }

  if (body.errors?.length) {
    throw new ApiError(body.errors[0].message, { status: response.status, errors: body.errors });
  }
  return body.data;
}
