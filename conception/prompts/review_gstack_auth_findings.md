# /review + security.md — Audit du prompt auth + analyse skills gstack

---

## Scope Check

**Intent :** corriger 9 bugs auth (cookies httpOnly, credentials, CORS, RefreshToken BDD, bfcache)
**Delivered :** prompt CC couvrant backend + frontend + middleware + BDD
**Scope :** CLEAN

---

## Security Specialist — findings sur le prompt auth

### [CRITICAL] (confidence: 9/10) `auth.controller.ts` — Timing attack sur la vérification du refreshToken

Le prompt demande de boucler sur les tokens stockés et de comparer avec `comparePassword` (argon2) :

```ts
for (const record of stored) {
  if (await comparePassword(raw, record.token)) {
    matchedRecord = record;
    break;
  }
}
```

**Problème :** argon2 est intentionnellement lent (protection brute force), mais une boucle sur plusieurs tokens sera d'autant plus lente qu'il y a de tokens valides pour un utilisateur — et s'arrête dès le premier match. C'est une comparaison à temps non-constant relative au nombre de tokens.

**Fix :** ajouter dans `refreshAccessToken` une **suppression préalable des tokens expirés** et une **limite de tokens actifs par utilisateur** (max 5 sessions simultanées) :

```ts
// Nettoyer les tokens expirés avant la vérification
await prisma.refresh_token.deleteMany({
  where: { user_id: userId, expired_at: { lte: new Date() } }
});

// Limiter les sessions actives (prévention accumulation)
const stored = await prisma.refresh_token.findMany({
  where: { user_id: userId, expired_at: { gt: new Date() } },
  orderBy: { issued_at: 'desc' },
  take: 5,
});
```

---

### [CRITICAL] (confidence: 9/10) `auth.controller.ts` — IDOR sur `POST /orders`

**Hors prompt auth mais détecté via checklist IDOR :**

Dans `BasketPage.tsx`, la commande envoie `user_id: user.id` dans le body :

```ts
body: JSON.stringify({
  user_id: user.id,   // ← contrôlé par le client
  lines: items.map(...)
})
```

Le backend (`orders.controller.ts`) ne doit pas faire confiance à ce `user_id` — il doit utiliser `req.user.id` (issu du token vérifié). À vérifier dans `orders.controller.ts` et à corriger dans `BasketPage.tsx` (supprimer `user_id` du body).

**Fix dans le prompt :** ajouter dans `BasketPage.tsx` :
```ts
// Supprimer user_id du body — le backend doit utiliser req.user.id
body: JSON.stringify({
  lines: items.map((item) => ({
    session_id: item.sessionId,
    tickets_qty: item.quantity,
  })),
}),
```

---

### [CRITICAL] (confidence: 8/10) `auth.controller.ts` — Pas de rate limiting sur `/api/auth/login`

La route login n'a aucune protection brute force. Avec les mots de passe hashés en argon2 (lent), chaque tentative consomme du CPU serveur.

**Fix à ajouter au prompt :**
```bash
cd backend && npm install express-rate-limit
```

Dans `auth.router.ts` :
```ts
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { status: 'error', message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, authController.loginUser);
router.post('/refresh', loginLimiter, authController.refreshAccessToken);
```

---

### [CRITICAL] (confidence: 8/10) `requireAuth` — `cookie-parser` doit être monté AVANT `requireAuth`

Le prompt corrige `requireAuth` pour lire `req.cookies.accessToken` mais ne précise pas **l'ordre de montage** dans `app.ts`. Si `cookie-parser` est monté après les routes API, `req.cookies` sera undefined sur tous les appels authentifiés.

**Ordre obligatoire dans `app.ts` :**
```ts
app.use(cookieParser());        // 1. parser les cookies
app.use(express.json());        // 2. parser le body JSON
app.use(cors({ ... }));         // 3. CORS
app.use('/api', apiRouter);     // 4. routes (requireAuth lit req.cookies ici)
```

Le prompt actuel le précise mais sans l'ordre explicite par rapport à `express.json()` et `cors`. À clarifier.

---

### [INFORMATIONAL] (confidence: 9/10) `auth.controller.ts` — `logoutUser` ne vérifie pas l'expiration avant `verifyRefreshToken`

```ts
const { userId } = verifyRefreshToken(raw);
```

Si le refreshToken est expiré au moment du logout, `verifyRefreshToken` lance une exception → le cookie n'est pas clearé. L'utilisateur reste "connecté" côté browser.

**Fix :** wrapper en try/catch et clearer les cookies quoi qu'il arrive (déjà partiellement présent dans le prompt mais à expliciter) :

```ts
export async function logoutUser(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      try {
        const { userId } = verifyRefreshToken(raw);
        await prisma.refresh_token.deleteMany({ where: { user_id: userId } });
      } catch {
        // Token expiré ou invalide — on déconnecte quand même
      }
    }
  } finally {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(200).json({ status: 'success', message: 'logged out' });
  }
}
```

---

### [INFORMATIONAL] (confidence: 8/10) `requireRole` — N+1 query à chaque requête authentifiée

```ts
const roleName = req.user.roleName ?? (await prisma.roles.findUnique({ where: { id: req.user.roleId } }))?.name;
```

Chaque requête qui passe par `requireRole` fait potentiellement un aller-retour BDD pour résoudre le nom du rôle. Avec le passage aux cookies, le `roleId` est dans le payload du token — mais le `roleName` n'y est pas.

**Fix :** inclure `roleName` dans le payload du JWT access token à la génération :

```ts
// tokens.ts
export function generateAccessToken(userId: number, roleId: number, roleName: string): string {
  return jwt.sign({ userId, roleId, roleName }, config.jwt.accessSecret, { ... });
}

// requireAuth.ts — lire roleName du token
const { userId, roleId, roleName } = verifyAccessToken(token);
req.user = { id: userId, roleId, roleName };
```

Cela évite la query BDD sur chaque requête protégée.

---

### [INFORMATIONAL] (confidence: 7/10) `authStore.ts` — `persist` avec `user` en localStorage reste un vecteur XSS partiel

Le prompt garde `partialize: (state) => ({ user: state.user })` — `user` contient `id`, `firstname`, `lastname`, `email`, `role_id`. Ces données personnelles en localStorage sont lisibles par XSS.

**Fix recommandé :** supprimer complètement `persist` — reconstruire `user` depuis `/api/auth/profile` à chaque `refreshToken()`. C'est déjà le cas dans le prompt (le `refreshToken()` fetch le profil), donc la persistance de `user` devient redondante.

```ts
// Supprimer persist entièrement
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isHydrating: true,
  // ...
}));
```

---

### [INFORMATIONAL] (confidence: 7/10) API Contract — `POST /orders` body change non documenté

Le prompt supprime `user_id` du body dans `BasketPage.tsx`. Si d'autres clients (futurs, backoffice) envoient `user_id`, ils obtiendront un comportement silencieusement différent.

S'assurer que `orders.controller.ts` ignore explicitement `user_id` du body et utilise toujours `req.user.id`.

---

## Résumé findings

| # | Sévérité | Fichier | Finding |
|---|----------|---------|---------|
| 1 | CRITICAL | `auth.controller.ts` | Boucle argon2 + pas de limite sessions actives |
| 2 | CRITICAL | `BasketPage.tsx` + `orders.controller.ts` | IDOR — `user_id` client-controlled |
| 3 | CRITICAL | `auth.router.ts` | Pas de rate limiting login/refresh |
| 4 | CRITICAL | `app.ts` | Ordre montage middlewares à expliciter |
| 5 | INFO | `auth.controller.ts` | `logoutUser` — token expiré bloque le clearCookie |
| 6 | INFO | `requireRole` | N+1 query — roleName absent du JWT |
| 7 | INFO | `authStore.ts` | `persist` user en localStorage à supprimer |
| 8 | INFO | `orders.controller.ts` | `user_id` body à ignorer explicitement |

---

## Corrections à intégrer dans le prompt CC

### Ajout #1 — `auth.router.ts` : rate limiting

```ts
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, authController.loginUser);
router.post('/refresh', authLimiter, authController.refreshAccessToken);
```

```bash
cd backend && npm install express-rate-limit
```

### Ajout #2 — `auth.controller.ts` : limite sessions actives + logoutUser robuste

Dans `refreshAccessToken`, avant la boucle de vérification :
```ts
await prisma.refresh_token.deleteMany({
  where: { user_id: userId, expired_at: { lte: new Date() } }
});
const stored = await prisma.refresh_token.findMany({
  where: { user_id: userId, expired_at: { gt: new Date() } },
  orderBy: { issued_at: 'desc' },
  take: 5,
});
```

`logoutUser` : wrapper try/finally pour garantir le clearCookie (voir code ci-dessus).

### Ajout #3 — `BasketPage.tsx` : supprimer `user_id` du body

```ts
body: JSON.stringify({
  lines: items.map((item) => ({
    session_id: item.sessionId,
    tickets_qty: item.quantity,
  })),
}),
```

### Ajout #4 — `tokens.ts` + `requireAuth.ts` : inclure `roleName` dans le JWT

```ts
// tokens.ts — generateAccessToken
export function generateAccessToken(userId: number, roleId: number, roleName: string): string {
  return jwt.sign({ userId, roleId, roleName }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as unknown as Expiry,
  });
}

// requireAuth.ts
const { userId, roleId, roleName } = verifyAccessToken(token);
req.user = { id: userId, roleId, roleName };
```

Mettre à jour les appels à `generateAccessToken` dans `auth.controller.ts` pour passer `user.role_name` ou `role.name`.

### Ajout #5 — `authStore.ts` : supprimer `persist`

Remplacer `create<AuthStore>()(persist(...))` par `create<AuthStore>()((set) => ...)` sans wrapper `persist`. Le `refreshToken()` reconstruit déjà `user` depuis l'API.

### Ajout #6 — `app.ts` : ordre explicite des middlewares

```ts
app.use(cookieParser());                                    // 1
app.use(express.json());                                    // 2
app.use(cors({ origin: config.server.allowedOrigins, credentials: true })); // 3
app.use('/api', apiRouter);                                 // 4
```

---

## Analyse skills gstack utiles pour claude.ai sur ce projet

### Skills directement applicables aujourd'hui

**`/review` + `security.md`**
Appliqué ci-dessus. À utiliser systématiquement avant tout prompt de correction touchant auth, routes, middlewares, ou BDD. Checklist couvre IDOR, XSS, injection, crypto, secrets exposure, rate limiting.

**`/review` + `api-contract.md`**
Pertinent dès qu'une route change de signature (body, status code, auth requirement). Exemple : la suppression de `token` dans le body de `/login` est un breaking change API — à documenter ou versionner.

**`/review` + `performance.md`**
N+1 queries dans `requireRole` détecté ci-dessus grâce à cette checklist. À appliquer sur toute PR touchant les controllers ou les requêtes Prisma.

**`/investigate`**
Iron Law : pas de fix sans root cause. Aurait évité les erreurs initiales sur ce bug auth (on aurait tracé le cookie manquant dès le premier test au lieu de corriger symptôme par symptôme). À utiliser dès qu'un bug est rapporté.

**`/cso`**
Audit sécurité complet : secrets archaeology, OWASP Top 10, STRIDE threat modeling, dépendances supply chain. À faire avant la mise en prod VPS.

### Skills utiles à venir

**`/plan-eng-review`**
Architecture review avant d'implémenter les features suivantes : système de paiement, backoffice admin, i18n. Évite de construire sur des fondations mal posées.

**`/qa`**
Tests browser automatisés (Playwright). Utile pour valider le flux auth end-to-end : login → panier → commande → logout → bfcache test. À utiliser une fois les fixes auth déployés.

**`/retro`**
Analyse des commits de la session auth pour documenter ce qui a bloqué et pourquoi. Utile pour ne pas répéter les mêmes erreurs sur les prochains sprints.
