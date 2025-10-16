// module augmentation : globel express module import, then fusion with the new types
import "express"

declare module "express-serve-static-core" {
  interface Request {
    userId?: string
    userRole?: string
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: import("../middlewares/checkRoles").Role
    }
  }
}
