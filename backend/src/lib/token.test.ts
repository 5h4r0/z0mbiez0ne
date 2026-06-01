import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './tokens.js';

describe('generateAccessToken', () => {
  it('returns a valid JWT string', () => {
    const token = generateAccessToken(1, 2);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('embeds userId and roleId in the payload', () => {
    const token = generateAccessToken(42, 1);
    const payload = jwt.decode(token) as Record<string, unknown>;
    expect(payload.userId).toBe(42);
    expect(payload.roleId).toBe(1);
  });

  it('sets an expiry', () => {
    const token = generateAccessToken(1, 2);
    const payload = jwt.decode(token) as Record<string, unknown>;
    expect(payload.exp).toBeDefined();
  });
});

describe('generateRefreshToken', () => {
  it('returns a jwt string and a UUID tokenId', () => {
    const { jwt: token, tokenId } = generateRefreshToken(1);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(tokenId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('embeds userId and tokenId in the payload', () => {
    const { jwt: token, tokenId } = generateRefreshToken(7);
    const payload = jwt.decode(token) as Record<string, unknown>;
    expect(payload.userId).toBe(7);
    expect(payload.tokenId).toBe(tokenId);
  });

  it('generates a different tokenId on each call', () => {
    const a = generateRefreshToken(1);
    const b = generateRefreshToken(1);
    expect(a.tokenId).not.toBe(b.tokenId);
  });
});

describe('verifyAccessToken', () => {
  it('returns the payload for a valid token', () => {
    const token = generateAccessToken(3, 2);
    const payload = verifyAccessToken(token);
    expect(payload).toEqual({ userId: 3, roleId: 2 });
  });

  it('throws for a tampered token', () => {
    const token = generateAccessToken(1, 1);
    expect(() => verifyAccessToken(`${token}x`)).toThrow();
  });

  it('throws for a token signed with the wrong secret', () => {
    const bad = jwt.sign({ userId: 1, roleId: 1 }, 'wrong-secret');
    expect(() => verifyAccessToken(bad)).toThrow();
  });
});

describe('verifyRefreshToken', () => {
  it('returns the payload for a valid token', () => {
    const { jwt: token, tokenId } = generateRefreshToken(5);
    const payload = verifyRefreshToken(token);
    expect(payload.userId).toBe(5);
    expect(payload.tokenId).toBe(tokenId);
  });

  it('throws for a tampered token', () => {
    const { jwt: token } = generateRefreshToken(1);
    expect(() => verifyRefreshToken(`${token}x`)).toThrow();
  });

  it('throws for a token signed with the wrong secret', () => {
    const bad = jwt.sign({ userId: 1, tokenId: 'abc' }, 'wrong-secret');
    expect(() => verifyRefreshToken(bad)).toThrow();
  });
});
