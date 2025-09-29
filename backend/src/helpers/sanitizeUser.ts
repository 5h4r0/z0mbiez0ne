import type { users } from "@prisma/client";

export function sanitizeUser(user: users) {
  const { password_hash: _, ...rest } = user;
  return rest;
}
