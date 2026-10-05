import { USE_MOCKS } from '../constants/config';
import createApi from './createApi';
import * as httpApi from './memoTestApi';
import * as mockApi from './mocks/mockApi';

/**
 * API used by the whole app. It uses the GraphQL backend when `VITE_API_URL`
 * is set and switches to the mocks if the server does not answer; without
 * `VITE_API_URL` it uses the mocks from the start. Tests replace this module
 * with `vi.mock('../api')`.
 */
const api = createApi({ useServer: !USE_MOCKS, httpApi, mockApi });

export default api;
