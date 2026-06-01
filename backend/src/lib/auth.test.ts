// backend/src/lib/auth.test.ts
import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from './auth.js';

describe('hashPassword', () => {
  it('returns a string', async () => {
    const hash = await hashPassword('password123');
    expect(typeof hash).toBe('string');
  });

  it('produces a different hash on each call', async () => {
    const a = await hashPassword('password123');
    const b = await hashPassword('password123');
    expect(a).not.toBe(b);
  });

  it('does not return the plain password', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
  });
});

describe('comparePassword', () => {
  it('returns true for a matching password', async () => {
    const hash = await hashPassword('correct');
    expect(await comparePassword('correct', hash)).toBe(true);
  });

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('correct');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });

  it('returns false for an empty string', async () => {
    const hash = await hashPassword('correct');
    expect(await comparePassword('', hash)).toBe(false);
  });
});