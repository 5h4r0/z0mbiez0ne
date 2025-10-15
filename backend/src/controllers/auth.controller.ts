import type { users } from "@prisma/client"
import argon2 from "argon2"
import type { Request, Response } from "express"
import z from "zod"
import { config } from "../config/config.js"
import { BadRequestError, ConflictError, UnauthorizedError } from "../lib/errors.js"
import { generateAuthenticationTokens } from "../lib/token.js"
import { prisma } from "../models/index.js"


/** Register */
export function registerUser(req: Request, res: Response) {
  const passwordBlacklist: string[] = process.env.PASSWORDS_BLACKLIST
    ? process.env.PASSWORDS_BLACKLIST?.split(",").map((o) => o.trim())
    : []

  const passwordSchema = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be at most 100 characters long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .refine((val) => !/\s/.test(val), { message: "Password must not contain spaces" })
    .refine((val) => !passwordBlacklist.includes(val), { message: "This password is not allowed" })

  const registerUserBodySchema = z.object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.email(),
    role_id: z.number(),
    password: passwordSchema,
    confirm: z.string()
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "Passwords do not match" })

  registerUserBodySchema.parseAsync(req.body)
    .then(({ firstname, lastname, email, password, confirm, role_id }) => {
      // Validate password confirmation
      return password !== confirm
        ? Promise.reject(new BadRequestError("Password and confirmation do not match"))
        // Check if email is already used by any existing user
        : prisma.users.findFirst({ where: { email } })
            .then((existing) => {
              return existing
                ? Promise.reject(new ConflictError("Email already taken"))
                // If email is unique, hash the password
                : argon2.hash(password).then((hashed_password) => ({
                    firstname,
                    lastname,
                    email,
                    role_id,
                    password_hash: hashed_password
                  }));
            });
    })
    .then((data) =>
      // Create the new user, excluding password_hash from the response
      prisma.users.create({
        data,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role_id: true
        }
      })
    )
    .then((newUser) =>
      res.status(201).json({
        status: "success",
        data: newUser,
        message: "User registered successfully"
      })
    )
    .catch((error) => {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: error.issues.map((e) => e.message).join(", ")
        });
      }
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to register user"
      });
    });
}


/** Login */

// schema for login body validation
const loginUserBodySchema = z.object({
  email: z.email({ message: "invalid email address" }),
  password: z.string().min(1, { message: "password is required" })
});

export const loginUser = (req: Request, res: Response) => {
  // body validation through zod
  return loginUserBodySchema.parseAsync(req.body)
    .then(({ email, password }) =>
      // search user by email
      prisma.users.findFirst({ where: { email } })
        .then((user) => {
          return !user
            ? Promise.reject(new UnauthorizedError("email and password do not match"))
            : argon2.verify(user.password_hash, password)
                .then((isMatching) => ({ user, isMatching }));
        })
        .then(({ user, isMatching }) => {
          // log login attempt
          console.log(`login attempt for ${user.email} → ${isMatching ? "SUCCESS" : "FAILURE"}`);

          // reject if password is not matching
          return !isMatching
            ? Promise.reject(new UnauthorizedError("email and password do not match"))
            : (() => {
                // generate signed jwt access token and opaque refresh token
                const { accessToken, refreshToken } = generateAuthenticationTokens({
                  id: user.id
                });

                // replace refresh token in database
                replaceRefreshTokenInDatabase(refreshToken, user);

                // choose auth mode based on client header (default cookie)
                const mode = req.header("X-Auth-Mode") || "cookie";

                return mode === "bearer"
                  // bearer mode → return tokens in json (for mobile apps / public api)
                  ? res.status(200).json({
                      status: "success",
                      token: accessToken,
                      type: "Bearer",
                      refresh_token: refreshToken,
                      expiresInMS: 60 * 60 * 1000,
                      message: `user ${email} logged in successfully`
                    })
                  // cookie mode → set httponly cookies and return minimal json (for web clients)
                  : (() => {
                      setAccessTokenCookie(res, accessToken);
                      setRefreshTokenCookie(res, refreshToken);
                      return res.status(200).json({
                        status: "success",
                        message: `user ${email} logged in successfully`
                      });
                    })();
              })();
        })
    )
    .catch((error) => {
      // global catch for zod errors, unauthorized errors, and internal errors
      res.status(error.status || 500).json({
        status: "error",
        message: error.message || "login failed"
      });
    });
};


/** Logout */
export async function logoutUser(_: Request, res: Response) {
  const randomStringToUnsetCookieValueOnClient = Math.random().toString();

  // session cookie, deleted when session ends (no Max-Age)
  res.cookie("accessToken", randomStringToUnsetCookieValueOnClient);
  res.cookie("refreshToken", randomStringToUnsetCookieValueOnClient);
  res.status(202).json({ status: 200, message: "Successfully logged out"});
}


/** Refresh token */
export async function refreshAccessToken(req: Request, res: Response) {
  // get token in cookies or body
  const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (! rawToken) {
    throw new UnauthorizedError("Refresh token not provided");
  }

  // search refresh token in DB, with the user
  const existingRefreshToken = await prisma.refreshToken.findFirst({
    where: { token: rawToken },
    include: { user: true }
  });
  if (! existingRefreshToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  // verify token validity
  if (existingRefreshToken.expired_at < new Date()) { // expired token
    await prisma.refreshToken.delete({ where: { id: existingRefreshToken.id } }); // delete token
    throw new UnauthorizedError("Expired refresh token");
  }

  // generate auth tokens
  const { accessToken, refreshToken } = generateAuthenticationTokens(existingRefreshToken.user);

  // the user's existing token is removed from DB before creating a new one
  await replaceRefreshTokenInDatabase(refreshToken, existingRefreshToken.user);
  
  // add tokens to cookies (via headers)
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  // response to client, JWT in the response
  res.json({ accessToken, refreshToken });
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  const userId = req.body;

  // get the user in DB (without password)
  const user = await prisma.users.findUnique({
    where: { id: userId },
    omit: { password_hash: true }
  });
  if (! user) { throw new UnauthorizedError("JWT payload does not match any user"); }

  // Renvoie des données controlées
  res.json(user);
}

interface Token {
  token: string;
  type: string;
  expiresInMS: number;
}

// replace refresh token in DB
async function replaceRefreshTokenInDatabase(refreshToken: Token, user: users) {
  await prisma.refreshToken.deleteMany({ where: { user_id: user.id }});
  await prisma.refreshToken.create({ data: {
    token: refreshToken.token,
    user_id: user.id,
    issued_at: new Date(),
    expired_at: new Date(Date.now() + refreshToken.expiresInMS),
  }});
}

// set access token coockie with conf
function setAccessTokenCookie(res: Response, accessToken: Token) {
  res.cookie("accessToken", accessToken.token, {
    httpOnly: true,
    maxAge: accessToken.expiresInMS,
    secure: config.server.secure // HTTP or HTTPS
  });
}

// set refresh token coockie with conf
function setRefreshTokenCookie(res: Response, refreshToken: Token) {
  res.cookie("refreshToken", refreshToken.token, {
    httpOnly: true,
    maxAge: refreshToken.expiresInMS,
    secure: config.server.secure, // HTTP or HTTPS
    path: "/api/auth/refresh" // security: the cookie will be sent (front -> back) only via this route only (limits transfers of this cookie)
  });
}
