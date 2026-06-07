# Prompt CC — feat/email-verification

**Branche : `feat/email-verification`**

Implémente la vérification d'adresse email.

---

## 1. Migration Prisma

**`backend/src/models/schema.prisma`**

Ajouter sur le modèle `users` :

```prisma
email_verified_at DateTime? @db.Timestamp(6)
```

Ajouter la relation dans `users` :

```prisma
emailVerificationTokens EmailVerificationToken[]
```

Nouveau modèle (même pattern que `PasswordResetToken`) :

```prisma
model EmailVerificationToken {
  id         Int       @id @default(autoincrement())
  user_id    Int
  token_hash String    @db.Text
  expires_at DateTime
  used_at    DateTime?
  created_at DateTime  @default(now())
  user       users     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("email_verification_tokens")
}
```

Générer la migration :

```bash
npm run db:gen -- --name add_email_verification
```

---

## 2. `backend/src/lib/mailer.ts`

Ajouter une fonction `sendVerificationEmail(to: string, verifyUrl: string): Promise<void>` avec le même style HTML que `sendPasswordResetEmail` — thème ZombieZone dark/rouge, sujet `zØmbie zØne — Confirmez votre adresse email`, lien valable 24h.

---

## 3. `backend/src/lib/emailVerification.ts` (nouveau fichier)

Fonction utilitaire réutilisable :

```ts
export async function createAndSendVerificationToken(userId: number, email: string): Promise<void>
```

- Invalide les tokens précédents non utilisés (`used_at = now()`)
- Génère un token `crypto.randomBytes(32).toString('hex')`
- Hash avec argon2
- Expire dans 24h
- Crée le `EmailVerificationToken` en base
- Construit `verifyUrl = ${config.app.frontendUrl}/verify-email?token=${rawToken}`
- Appelle `sendVerificationEmail(email, verifyUrl)`

---

## 4. `backend/src/controllers/auth.controller.ts`

**`registerUser`** — après la création du user, appeler `createAndSendVerificationToken(user.id, user.email)`. Ne pas bloquer la réponse si l'envoi échoue (try/catch silencieux avec `console.error`).

Ajouter deux nouveaux controllers dans ce fichier :

**`sendVerificationEmail`** :
- `requireAuth` (l'utilisateur doit être connecté)
- Appelle `createAndSendVerificationToken(req.user.id, req.user.email)`
- Retourne `200 { success: true, message: 'Email de vérification envoyé.' }`

**`verifyEmail`** :
- Public
- Reçoit `token` en query string (Zod : `z.string().min(1)`)
- Charge tous les `EmailVerificationToken` avec `used_at: null` et `expires_at > now()`
- Vérifie chaque `token_hash` avec `argon2.verify` (même pattern que `validateResetToken` dans `passwordReset.controller.ts`)
- Si valide : `$transaction` → `users.update({ email_verified_at: new Date() })` + `EmailVerificationToken.update({ used_at: new Date() })`
- Retourne `200 { success: true, message: 'Adresse email confirmée.' }`
- Si invalide : `400 { success: false, message: 'Token invalide ou expiré.' }`

---

## 5. `backend/src/routers/auth.router.ts`

Ajouter :

```ts
router.post('/send-verification-email', requireAuth, authController.sendVerificationEmail);
router.get('/verify-email', authController.verifyEmail);
```

---

## 6. `backend/src/controllers/users.controller.ts`

**`updateUser`** — après le check `existing` (email déjà pris), détecter si l'email change :

```ts
const currentUser = await prisma.users.findUnique({
  where: { id: userId },
  select: { email: true },
});
const emailChanged = currentUser && body.email !== currentUser.email;
```

Si `emailChanged` :
- Inclure `email_verified_at: null` dans le `data` du `prisma.users.update`
- Appeler `createAndSendVerificationToken(userId, body.email)` après le update (try/catch silencieux)

---

## 7. `backend/src/controllers/orders.controller.ts`

**`createOrder`** — après le check `if (!req.user)`, ajouter :

```ts
const user = await prisma.users.findUnique({
  where: { id: req.user.id },
  select: { email_verified_at: true },
});
if (!user?.email_verified_at) {
  res.status(403).json({
    success: false,
    message: 'Vous devez confirmer votre adresse email avant de passer commande.',
  });
  return;
}
```

---

## 8. Frontend

**`vite-frontend/src/pages/VerifyEmailPage.tsx`** (nouveau fichier) — page `/verify-email?token=...` :
- Au mount, appelle `GET /api/auth/verify-email?token=...`
- Affiche succès ou erreur avec le style ZombieZone
- Lien vers la page d'accueil

**`vite-frontend/src/components/App.tsx`** — ajouter la route `/verify-email`.

**Dans le flow commande** — identifier le composant qui initie `createOrder` et intercepter le `403` avec ce message : afficher un bandeau avec un bouton "Renvoyer l'email de confirmation" qui appelle `POST /api/auth/send-verification-email`.

---

## 9. Vérifications finales

```bash
# depuis backend/
npm run db:gen

# tests existants
npm test

# lint frontend
cd vite-frontend && npx biome check src/
```
