import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { getPagination } from './getPagination.js';

function makeReq(query: Record<string, string> = {}): Request {
  return { query } as unknown as Request;
}

describe('getPagination', () => {
  it('returns undefined for both when query is empty', () => {
    expect(getPagination(makeReq())).toEqual({ take: undefined, skip: undefined });
  });

  it('parses a valid limit into take', () => {
    expect(getPagination(makeReq({ limit: '10' }))).toEqual({ take: 10, skip: undefined });
  });

  it('parses a valid offset into skip', () => {
    expect(getPagination(makeReq({ offset: '20' }))).toEqual({ take: undefined, skip: 20 });
  });

  it('parses both limit and offset', () => {
    expect(getPagination(makeReq({ limit: '5', offset: '15' }))).toEqual({ take: 5, skip: 15 });
  });

  it('rejects limit=0 (returns undefined)', () => {
    expect(getPagination(makeReq({ limit: '0' })).take).toBeUndefined();
  });

  it('rejects negative limit', () => {
    expect(getPagination(makeReq({ limit: '-1' })).take).toBeUndefined();
  });

  it('accepts offset=0', () => {
    expect(getPagination(makeReq({ offset: '0' })).skip).toBe(0);
  });

  it('rejects negative offset', () => {
    expect(getPagination(makeReq({ offset: '-5' })).skip).toBeUndefined();
  });

  it('rejects non-numeric strings', () => {
    const result = getPagination(makeReq({ limit: 'abc', offset: 'xyz' }));
    expect(result.take).toBeUndefined();
    expect(result.skip).toBeUndefined();
  });
});
