import { Router } from 'express';
import { z } from 'zod';
import { sendContactEmail } from '../lib/mailer.js';

export const router = Router();

const contactSchema = z.object({
  nom: z.string().min(1).max(100),
  email: z.string().email(),
  sujet: z.enum(['reservation', 'annulation', 'info', 'presse', 'zombie', 'autre']),
  message: z.string().min(1).max(2000),
});

router.post('/contact', async (req, res, next) => {
  try {
    const { nom, email, sujet, message } = contactSchema.parse(req.body);
    await sendContactEmail(nom, email, sujet, message);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});
