import type { Request } from "express"

const testRequest = (req: Request) => {
  console.log(req.userId)     // CTRL + hover: string | undefined
  console.log(req.userRole)   // string | undefined
  console.log(req.method)     // string
}