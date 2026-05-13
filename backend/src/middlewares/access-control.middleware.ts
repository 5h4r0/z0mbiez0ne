// Note: this file intentionally uses .then/.catch instead of async/await.
// The chain is linear (no nesting): extract token → verify → decode → check role.
// This is the ideal use case for .then/.catch: each step passes its result to the next, .catch at the bottom catches everything.

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/config.js';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

// -> single source of truth for all allowed roles in code
const ROLE_VALUES = ['Member', 'Admin'] as const;

// -> type built directly from ROLE_VALUES -> no manual sync
type Role = (typeof ROLE_VALUES)[number];

// -> schema to validate and parse jwt payload
const JwtPayloadSchema = z
  .object({
    // -> user unique id inside token
    userId: z.string().min(1),
    // -> user role, must be one of ROLE_VALUES
    role: z.enum(ROLE_VALUES),
  })
  .strict();

// -> typescript type inferred from zod schema -> keeps runtime and compile time synced
type JwtPayloadData = z.infer<typeof JwtPayloadSchema>;

// factory -> builds a middleware that allows only selected roles
const checkRoles =
  // takes a list of allowed roles like ["Admin", "Member"]
    (roles: Role[]) =>
    // returns the actual express middleware
    (req: Request, _res: Response, next: NextFunction) => {
      // get access token from request headers/cookies
      extractAccessToken(req)
        // decode token -> returns jwt payload (userId + role)
        .then((token) => verifyAndDecodeJWT(token))
        // destructure payload -> check if role allowed
        .then(({ userId, role }) =>
          roles.includes(role)
            ? Object.assign(req, { userId, userRole: role }) && next()
            : Promise.reject(new ForbiddenError(`permission denied for role: ${role}`)),
        )
        // catch any error -> invalid token, missing token, role not allowed
        // -> pass it to express error middleware
        .catch(next);
    };

// -> extract access token from cookie or bearer header
const extractAccessToken = (req: Request): Promise<string> =>
  Promise.resolve(
    typeof (req as unknown as { cookies?: { accessToken?: unknown } }).cookies?.accessToken === 'string'
      ? (req as unknown as { cookies: { accessToken: string } }).cookies.accessToken
      : typeof req.headers?.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null,
  ).then((t) => (t ? t : Promise.reject(new UnauthorizedError('missing access token'))));

// -> verify jwt and decode payload using zod
const verifyAndDecodeJWT = (token: string): Promise<JwtPayloadData> =>
  new Promise<jwt.JwtPayload | string>((resolve, reject) =>
    jwt.verify(
      token,
      ((config as unknown as { jwt?: { accessTokenSecret?: unknown }; ACCESS_TOKEN_SECRET?: unknown }).jwt
        ?.accessTokenSecret ?? (config as unknown as { ACCESS_TOKEN_SECRET?: unknown }).ACCESS_TOKEN_SECRET) as string,
      { algorithms: ['HS256'] },
      (err, payload) =>
        err || payload === undefined
          ? reject(new UnauthorizedError('invalid token'))
          : resolve(payload as jwt.JwtPayload | string),
    ),
  )
    .then((payload) =>
      typeof payload === 'object' && payload !== null
        ? payload
        : Promise.reject(new UnauthorizedError('invalid jwt payload')),
    )
    .then((obj) => JwtPayloadSchema.parse(obj));

export { checkRoles };
