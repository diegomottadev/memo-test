import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Every test starts with an empty DOM and empty localStorage.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
