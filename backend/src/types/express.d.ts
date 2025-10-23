// module augmentation -> merge extra fields into express request
import "express"
import type { Role } from "../middlewares/access-control.middleware.js"

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: Role
    }
  }
}