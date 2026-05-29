import z from 'zod';

export const passwordBlacklist: string[] = process.env.PASSWORDS_BLACKLIST
  ? process.env.PASSWORDS_BLACKLIST.split(',').map((o) => o.trim())
  : [];

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' })
  .refine((val) => !/\s/.test(val), { message: 'Password must not contain spaces' })
  .refine((val) => !passwordBlacklist.includes(val), { message: 'This password is not allowed' });
