import { describe, expect, it } from 'vitest';
import { makeSlug } from './slugify.js';

describe('makeSlug', () => {
  it('lowercases the input', () => {
    expect(makeSlug('HELLO')).toBe('hello');
  });

  it('replaces spaces with hyphens', () => {
    expect(makeSlug('hello world')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(makeSlug('Événements Spéciaux')).toBe('evenements-speciaux');
  });

  it('strips leading and trailing hyphens', () => {
    expect(makeSlug('  hello  ')).toBe('hello');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(makeSlug('hello   world!!!')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(makeSlug('hello! @world#')).toBe('hello-world');
  });

  it('handles an empty string', () => {
    expect(makeSlug('')).toBe('');
  });

  it('preserves numbers', () => {
    expect(makeSlug('Zone 51')).toBe('zone-51');
  });
});
