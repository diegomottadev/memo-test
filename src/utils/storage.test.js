import { describe, expect, it, vi } from 'vitest';
import { listKeys, readJson, removeKeys, writeJson } from './storage';

describe('storage', () => {
  it('writes and reads JSON values', () => {
    writeJson('key', { a: 1 });
    expect(readJson('key')).toEqual({ a: 1 });
    expect(listKeys()).toEqual(['key']);
  });

  it('returns the fallback for missing keys and broken JSON', () => {
    expect(readJson('missing', 'fallback')).toBe('fallback');
    window.localStorage.setItem('broken', '{not json');
    expect(readJson('broken', 'fallback')).toBe('fallback');
  });

  it('removes several keys at once', () => {
    writeJson('a', 1);
    writeJson('b', 2);
    removeKeys('a', 'b');
    expect(listKeys()).toEqual([]);
  });

  it('never throws when storage is not available', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(readJson('key', 'fallback')).toBe('fallback');
    expect(() => writeJson('key', 1)).not.toThrow();
  });
});
