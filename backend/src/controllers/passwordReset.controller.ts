import crypto from 'node:crypto';
import * as argon2 from 'argon2';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendPasswordResetEmail } from '../lib/mailer.js';
import { passwordSchema } from '../lib/schemas/password.js';
import { prisma } from '../models/index.js';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const validateTokenSchema = z.object({
  token: z.string().min(1),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  new_password: passwordSchema,
});

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(200).json({ success: true, message: 'Si cet email existe, un lien a été envoyé.' });
    return;
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.users.findFirst({
      where: { email, deleted_at: null },
      select: { id: true, email: true },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await argon2.hash(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.passwordResetToken.updateMany({
        where: { user_id: user.id, used_at: null },
        data: { used_at: new Date() },
      });

      await prisma.passwordResetToken.create({
        data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt },
      });

      const resetUrl = `https://sharo.fr/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.status(200).json({ success: true, message: 'Si cet email existe, un lien a été envoyé.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function validateResetToken(req: Request, res: Response): Promise<void> {
  const parsed = validateTokenSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
    return;
  }

  const { token } = parsed.data;

  try {
    const records = await prisma.passwordResetToken.findMany({
      where: {
        used_at: null,
        expires_at: { gt: new Date() },
      },
      select: { id: true, token_hash: true },
    });

    let validRecord: { id: number } | null = null;
    for (const record of records) {
      const isValid = await argon2.verify(record.token_hash, token);
      if (isValid) {
        validRecord = { id: record.id };
        break;
      }
    }

    if (!validRecord) {
      res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Token valide.' });
  } catch (error) {
    console.error('validateResetToken error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { token, new_password } = parsed.data;

  try {
    const records = await prisma.passwordResetToken.findMany({
      where: {
        used_at: null,
        expires_at: { gt: new Date() },
      },
      select: { id: true, token_hash: true, user_id: true },
    });

    let validRecord: { id: number; user_id: number } | null = null;
    for (const record of records) {
      const isValid = await argon2.verify(record.token_hash, token);
      if (isValid) {
        validRecord = { id: record.id, user_id: record.user_id };
        break;
      }
    }

    if (!validRecord) {
      res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
      return;
    }

    const newPasswordHash = await argon2.hash(new_password);

    await prisma.$transaction([
      prisma.users.update({
        where: { id: validRecord.user_id },
        data: { password_hash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: validRecord.id },
        data: { used_at: new Date() },
      }),
      prisma.refreshToken.deleteMany({
        where: { user_id: validRecord.user_id },
      }),
    ]);

    res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}
