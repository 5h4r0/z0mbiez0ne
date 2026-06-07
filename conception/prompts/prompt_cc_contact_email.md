# CC — Formulaire /contact : envoi email

## Contexte

Le formulaire `/contact` existe côté frontend (`vite-frontend/src/pages/ContactPage.tsx`) avec 4 champs (nom, email, sujet, message) mais le `handleSubmit` ne fait que `console.log` + `setSent(true)`.

L'infra email (nodemailer, SMTP Ionos, transporter) est opérationnelle dans `backend/src/lib/mailer.ts` avec déjà `sendPasswordResetEmail` et `sendVerificationEmail`.

Objectif : brancher le formulaire à un endpoint `POST /api/contact` qui envoie un email à `z0mbiez0ne@sharo.fr`.

---

## 1. `backend/src/lib/mailer.ts` — ajouter `sendContactEmail`

Ajouter à la fin du fichier :

```typescript
const SUJET_LABELS: Record<string, string> = {
  reservation: 'Réservation de groupe',
  annulation: 'Annulation / Remboursement',
  info: 'Informations générales',
  presse: 'Presse & Partenariats',
  zombie: 'Signalement zombie (urgent)',
  autre: 'Autre',
};

export async function sendContactEmail(
  nom: string,
  email: string,
  sujet: string,
  message: string,
): Promise<void> {
  const sujetLabel = SUJET_LABELS[sujet] ?? sujet;
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    to: process.env.SMTP_FROM ?? 'z0mbiez0ne@sharo.fr',
    replyTo: email,
    subject: `[Contact] ${sujetLabel} — ${nom}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Message de contact</title></head>
<body style="background:#ffffff;color:#e0e0e0;font-family:sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #c0392b;border-radius:8px;">
          <tr><td style="padding:40px;">
            <h1 style="color:#c0392b;font-size:24px;margin-bottom:8px;">zØmbie zØne</h1>
            <p style="color:#aaa;margin-bottom:24px;">Nouveau message de contact</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;width:90px;">Nom</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${nom}</td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Email</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">
                  <a href="mailto:${email}" style="color:#c0392b;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="color:#aaa;font-size:13px;padding:6px 0;">Sujet</td>
                <td style="color:#e0e0e0;font-size:13px;padding:6px 0;">${sujetLabel}</td>
              </tr>
            </table>
            <div style="background:#1a1a1a;border-left:3px solid #c0392b;padding:16px;border-radius:4px;">
              <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="font-size:12px;color:#555;margin-top:24px;">
              Répondre directement à cet email pour contacter l'expéditeur.
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
```

---

## 2. `backend/src/routers/contact.router.ts` — créer le fichier

```typescript
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
```

---

## 3. `backend/src/routers/index.router.ts` — enregistrer le router

Ajouter l'import avec les autres imports en haut :

```typescript
import { router as contactRouter } from './contact.router.js';
```

Ajouter l'enregistrement après `router.use(uploadRouter);` :

```typescript
router.use(contactRouter);
```

---

## 4. `vite-frontend/src/pages/ContactPage.tsx` — brancher le fetch

Remplacer l'état et le handler existants.

Modifier les `useState` existants (garder `form` et `sent`, ajouter `loading` et `error`) :

```typescript
const [form, setForm] = useState<FormData>(INITIAL);
const [sent, setSent] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

Remplacer la fonction `handleSubmit` :

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSent(true);
      setForm(INITIAL);
    } else {
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  } catch {
    setError('Une erreur est survenue. Veuillez réessayer.');
  } finally {
    setLoading(false);
  }
}
```

Dans le JSX, modifier le bouton submit pour désactiver pendant le chargement :

```tsx
<button
  type="submit"
  disabled={loading}
  className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 self-start disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Envoi…' : 'Envoyer dans le vide'}
</button>
```

Ajouter l'affichage de l'erreur juste après le bouton (dans le formulaire, après le `<button>`) :

```tsx
{error && (
  <p className="text-[0.85rem] text-[#c0392b] mt-1">{error}</p>
)}
```

---

## Vérification

```bash
# Depuis la racine du monorepo
npm run dev

# Tester le formulaire sur http://localhost:5173/contact
# → Remplir tous les champs et soumettre → vérifier réception sur z0mbiez0ne@sharo.fr
# → Reply-To doit pointer vers l'email saisi dans le formulaire

# Tester validation Zod (sujet invalide → 400)
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"nom":"Test","email":"a@b.fr","sujet":"invalide","message":"test"}'
# Attendu : 400 avec erreur Zod
```
