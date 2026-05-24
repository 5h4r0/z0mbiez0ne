# Prompt CC — Mise à jour CLAUDE.md + création CLAUDE_AI.md

## Tâche

1. Mettre à jour `CLAUDE.md` : ajouter une section **Règles auth & sécurité** et corriger les infos obsolètes
2. Créer `CLAUDE_AI.md` à la racine du repo

---

## 1. Modifications à apporter à `CLAUDE.md`

### A. Remplacer dans la section `## Architecture > Backend`

**Remplacer :**
```
- **Auth** : JWT access token (15min) + refresh token (7j, httpOnly cookie)
```

**Par :**
```
- **Auth** : JWT access token (15min, cookie httpOnly) + refresh token (7j, cookie httpOnly)
- **cookie-parser** : requis et monté dans `app.ts` avant toutes les routes
- **CORS** : `credentials: true` obligatoire dans la config cors
```

### B. Remplacer dans la section `## Architecture > Frontend`

**Remplacer :**
```
- **Auth** : token JWT stocké côté client, refresh via cookie httpOnly
```

**Par :**
```
- **Auth** : accessToken et refreshToken exclusivement en cookie httpOnly — jamais localStorage, jamais sessionStorage
- **`credentials: 'include'`** : obligatoire sur tous les fetch auth (login, logout, refresh)
- **Guard réseau** : les pages protégées vérifient la session via call réseau au montage (protection bfcache)
```

### C. Ajouter une section complète après `## Règles de développement`

```markdown
## Règles auth & sécurité (non négociables)

### JWT — stockage des tokens
- **Jamais** de token en `localStorage` ou `sessionStorage` → vulnérable XSS
- **accessToken** : cookie `httpOnly`, `secure`, `sameSite: 'strict'`, `path: '/'`, durée 15min
- **refreshToken** : cookie `httpOnly`, `secure`, `sameSite: 'strict'`, `path: '/api/auth/refresh'`, durée 7j
- Le frontend ne lit jamais les tokens (httpOnly = inaccessible JS) — le browser les joint automatiquement

### JWT — implémentation backend (Express)
- `cookie-parser` monté dans `app.ts` **avant** toutes les routes
- Config CORS : `credentials: true` + origines explicites (pas `*`)
- `setRefreshCookie` : toujours les 4 flags — `httpOnly`, `secure`, `sameSite: 'strict'`, `path`
- `refreshAccessToken` : utiliser la table `RefreshToken` en BDD — rotation à chaque refresh, révocation à la déconnexion
- Stocker le **hash** du refreshToken en BDD (argon2), pas le token brut

### JWT — implémentation frontend (React/Zustand)
- `credentials: 'include'` sur **tous** les fetch auth : login, logout, refresh
- `refreshToken()` dans le store : ne pas conditionner à `user` — toujours tenter le refresh au démarrage
- `apiFetch` intercepteur 401 : retry après refresh, redirect vers `/dashboard` si refresh échoue
- Pages protégées : call réseau au montage pour valider la session (pas seulement `!!token` en mémoire)

### CSRF
- `sameSite: 'strict'` suffit si frontend et backend sont sur le même domaine (zombiezone.kadath.fr)
- Si cross-domain un jour : ajouter anti-CSRF token (double submit cookie pattern)

### bfcache (back-forward cache)
- Le bouton "précédent" restaure la page depuis la mémoire **sans re-exécuter le JS**
- Protection : `Cache-Control: no-store` sur les réponses des routes protégées + guard réseau au montage des pages auth
```

### D. Corriger la section `## Branches Git`

**Remplacer :**
```
main   → production
dev    → développement (branche de travail)
```

**Par :**
```
main              → production
customer-account-dev → branche de travail active
```

---

## 2. Créer `CLAUDE_AI.md` à la racine du repo

Contenu exact du fichier :

```markdown
# CLAUDE_AI.md
> Référence de session pour claude.ai — décisions validées, règles projet, patterns approuvés

---

## Accès au repo

```bash
git clone https://github.com/5h4r0/z0mbiez0ne.git
cd z0mbiez0ne && git checkout customer-account-dev
```

Toujours cloner et lire les fichiers concernés avant d'analyser ou proposer une correction.

---

## Règles de réponse

- Toujours préfixer les fichiers de code avec leur chemin relatif au monorepo
- Appliquer les bonnes pratiques d'office (sécurité, perf, archi, UX, naming) — ne pas attendre qu'on les demande
- En fin de réponse sur un sujet important : proposer de mémoriser ou de mettre à jour ce fichier

---

## Auth JWT — règles absolues (validées, ne pas re-débattre)

### Stockage
- **accessToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/; maxAge=15min`
- **refreshToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/api/auth/refresh; maxAge=7j`
- **Jamais** localStorage, sessionStorage, ou variable persistée entre sessions

### Backend Express
- `cookie-parser` monté dans `app.ts` avant toutes les routes
- CORS : `credentials: true` + origines explicites
- RefreshToken en BDD (table `RefreshToken`) : stocker le hash argon2, rotation à chaque refresh, suppression à la déconnexion
- Cookie flags obligatoires : `httpOnly`, `secure`, `sameSite: 'strict'`, `path` explicite

### Frontend React/Zustand
- `credentials: 'include'` sur tous les fetch auth
- Zustand `persist` : ne jamais persister le token — uniquement `user` si nécessaire (préférer re-fetch)
- `refreshToken()` : ne pas conditionner à `user`, toujours tenter au démarrage de l'app
- Pages protégées : vérification réseau au montage (pas seulement état Zustand) → protection bfcache

### bfcache
- Bouton précédent = restauration mémoire sans re-exécution JS → état Zustand potentiellement invalide
- Correction : `Cache-Control: no-store` sur routes protégées + guard réseau au montage

---

## Bugs auth résolus (session 2026-05-20) — ne pas réintroduire

| # | Fichier | Bug |
|---|---------|-----|
| 1 | `authStore.ts` | `credentials: 'include'` manquant sur login/logout/refresh |
| 2 | `app.ts` | CORS sans `credentials: true` |
| 3 | `authStore.ts` | `refreshToken()` conditionné à `user` null-check |
| 4 | `DashboardPage`, `BasketPage` | Pas de guard réseau au montage |
| 5 | `authStore.ts` | `apiFetch` redirige vers `/dashboard` après logout forcé (boucle) |
| 6 | `BasketPage` | `isAuthenticated()` sans vérif expiration token |
| 7 | `auth.controller.ts` | `sameSite` absent sur les cookies |
| 8 | `auth.controller.ts` | Table `RefreshToken` non utilisée — pas de révocation |
| 9 | `app.ts` | `cookie-parser` non monté |

---

## Stack & décisions (ne pas revisiter sans raison forte)

Voir `CLAUDE.md` — identique. Résumé des points clés :
- Express 5, Prisma, PostgreSQL, argon2, JWT stateless, Biome, Zustand, Vite, Docker
- Pas de SSR — SPA pure
- Branche active : `customer-account-dev`

---

## Patterns approuvés

### apiFetch (intercepteur 401)
```ts
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...options, credentials: 'include' });
  if (res.status !== 401) return res;

  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!refreshRes.ok) {
    await useAuthStore.getState().logout();
    window.location.href = '/dashboard'; // page login
    return res;
  }

  return fetch(url, { ...options, credentials: 'include' });
}
```

### Guard réseau sur page protégée
```ts
useEffect(() => {
  useAuthStore.getState().refreshToken().catch(() => {
    navigate('/dashboard');
  });
}, []);
```

### setRefreshCookie (backend)
```ts
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: config.server.secure,
  sameSite: 'strict',
  path: '/api/auth/refresh',
  maxAge: REFRESH_EXPIRES_MS,
});
```
```

---

## Commit à faire après ces modifications

```
docs: 📚 add CLAUDE_AI.md + update auth rules in CLAUDE.md
```
