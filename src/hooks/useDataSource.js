import { useSyncExternalStore } from 'react';
import api from '../api';

/**
 * Current data source of the API (`server`, `mock` or `fallback`). The
 * component renders again when the API switches to the mocks.
 *
 * @returns {'server'|'mock'|'fallback'}
 */
export default function useDataSource() {
  return useSyncExternalStore(api.subscribeDataSource, api.getDataSource);
}
