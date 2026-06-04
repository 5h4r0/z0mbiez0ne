import crypto from 'node:crypto';
import * as argon2 from 'argon2';
import { config } from '../config/config.js';
import { prisma } from '../models/index.js';
import { sendVerificationEmail } from './mailer.js';

export async function createAndSendVerificationToken(userId: number, email: string): Promise<void> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await argon2.hash(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.updateMany({
    where: { user_id: userId, used_at: null },
    data: { used_at: new Date() },
  });

  await prisma.emailVerificationToken.create({
    data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
  });

  const frontendUrl = config.app.frontendUrl;
  if (!frontendUrl) throw new Error('FRONTEND_URL is not defined');
  const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}`;
  await sendVerificationEmail(email, verifyUrl);
}
