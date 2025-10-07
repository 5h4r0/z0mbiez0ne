import { Role } from "@prisma/client"
import type { Request, Response, NextFunction } from "express"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js"
import { config } from "../config/config.js"


const JwtPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["Member", "Admin"])
})

type JwtPayloadData = z.infer<typeof JwtPayloadSchema>

const checkRoles = (roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    extractAccessToken(req)
      .then(token => verifyAndDecodeJWT(token))
      .then(({ userId, role }) =>
        roles.includes(role)
          ? (req.userId = userId, req.userRole = role, next())
          : Promise.reject(new ForbiddenError(`Permission denied for role: ${role}`))
      )
      .catch(next)
  }


const extractAccessToken = (req: Request): Promise<string> =>
  Promise.resolve(
  typeof req.cookies?.accessToken === "string"
    ? req.cookies.accessToken
    : typeof req.headers?.authorization === "string"
      ? req.headers.authorization
      : null
  )
  .then(token =>
    token
      ? token
      : Promise.reject(new UnauthorizedError("Access token not provided"))
  )


const verifyAndDecodeJWT = (accessToken: string): Promise<JwtPayloadData> => {
  try {
    const decoded = jwt.verify(accessToken, config.server.jwtSecret)
    const result = JwtPayloadSchema.safeParse(decoded)
    return result.success
      ? Promise.resolve(result.data)
      : Promise.reject(new UnauthorizedError("Invalid JWT payload structure"))
  } catch (error) {
    console.error(error)
    return Promise.reject(new UnauthorizedError("Invalid or expired access token"))
  }
}

export { checkRoles }



/** first version */

// function checkRoles(roles: Role[]) {
//     // return a middleware
//     return (req: Request, res: Response, next: NextFunction) => {
//       // JWT extraction from cookies or headers authorization
//       const token = extractAccessToken(req);

//       // JWT validation & decoding (userId + role) - signed cookie, zod validation is useless
//       const ( userId, role ) = verifyAndDecodeJWT(token);

//       // verify user's role which must be authorized in this route
//       if (! roles.includes(role)) {
//         // if KO: 403 Forbidden
//         throw new ForbiddenError(`Permission denied for role: ${role}`)
//       }

//       // authenticated userId and userRole added in req - to help the next controllers
//       // note: at this stage, we could also retrieve the user from the DB to attach it to req
//       // but that would be like stateful authentication (each API call the DB to obtain the user's information)
//       req.userId = userId
//       req.userRole = role

//       // if OK: next()
//       next()
//     }
// }


// function extractAccessToken(req: Request): string {
//   if (typeof req.cookies?.accessToken === "string")
//     return req.cookies.accessToken

//   if (typeof req.headers?.authorization === "string")
//     return req.headers.authorization

//   // if no accessToken, throw a unauthorized error which goes to the global-error-handler which return a 401
//   throw new UnauthorizedError("Access token not provided")
// }


// function verifyAndDecodeJWT(accesstoken: string): JwtPayload {
//   try {
//     const payload = jwt.verify(accesstoken, config.server.jwtSecret) as JwtPayload
//     return payload
//   }
//   catch {
//     console.error(Error)
//     throw new UnauthorizedError("Invalid or expired access token")
//   }
// }
