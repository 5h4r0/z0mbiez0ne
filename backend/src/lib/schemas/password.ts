import z from 'zod';

export const passwordBlacklist: string[] = process.env.PASSWORDS_BLACKLIST
  ? process.env.PASSWORDS_BLACKLIST.split(',').map((o) => o.trim())
  : [];

export const passwordSchema = z
  .string()
  .min(8, { message: 'Les mots de passe doivent être d\'au moins 8 caractères' })
  .max(100, { message: 'Les mots de passe doivent pas dépasser 100 characters' })
  .regex(/[a-z]/, { message: 'Les mots de passe doivent contenir au moins 1 lettre minuscule' })
  .regex(/[A-Z]/, { message: 'Les mots de passe doivent contenir au moins 1 lettre majuscule' })
  .regex(/[0-9]/, { message: 'Les mots de passe doivent contenir au moins 1 chiffre' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Les mots de passe doivent contenir au moins 1 caractère spécial' })
  .refine((val) => !/\s/.test(val), { message: 'Les mots de passe ne doivent pas contenir d\'espace' })
  .refine((val) => !passwordBlacklist.includes(val), { message: 'Ce mot de passe n\'est pas autorisé' });
