import type { Request } from 'express';

type Pagination = {
  take?: number | undefined;
  skip?: number | undefined;
};

export function getPagination(req: Request): Pagination {
  const limitParam = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const offsetParam = typeof req.query.offset === 'string' ? Number(req.query.offset) : undefined;

  return {
    take: Number.isFinite(limitParam ?? NaN) && (limitParam ?? 0) > 0 ? limitParam : undefined,
    skip: Number.isFinite(offsetParam ?? NaN) && (offsetParam ?? 0) >= 0 ? offsetParam : undefined,
  };
}
