import { describe, expect, it } from 'vitest';
import pageTitle from './pageTitle';

describe('pageTitle', () => {
  it('adds the app name to the page name', () => {
    expect(pageTitle('Animals')).toBe('Animals · Memo Test');
  });

  it('returns only the app name for the home page', () => {
    expect(pageTitle()).toBe('Memo Test');
  });
});
