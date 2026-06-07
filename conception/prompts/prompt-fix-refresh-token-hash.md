# Plan : fix hash JWT refresh token

## Contexte

`persistRefreshToken` hache actuellement `tokenId` (déjà stocké en clair dans `token_id`), ce qui est sans valeur sécuritaire. Le secret côté client est **le JWT entier** (cookie `refreshToken`) — c'est lui qui doit être haché. Le lookup reste sur `token_id` (UUID en clair, O(1)).

Modèle cible :
- `DB.token_id`   = UUID en clair → `WHERE token_id = ?`
- `DB.token_hash` = `argon2(JWT entier)` → `argon2.verify(cookie, token_hash)`

## Fichier modifié

[backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts)

## Changements

### 1. `persistRefreshToken` — ajouter paramètre `jwt` et hacher le JWT

```ts
// ligne 252
async function persistRefreshToken(userId: number, tokenId: string, jwt: string): Promise<void> {
  const token_hash = await hashPassword(jwt);   // était: hashPassword(tokenId)
  ...
}
```

### 2. Appels — passer le JWT local (3 occurrences)

| Fonction             | ligne | variable JWT    | avant                                      | après                                                     |
|----------------------|-------|-----------------|--------------------------------------------|-----------------------------------------------------------|
| `registerUser`       | 47    | `refreshJwt`    | `persistRefreshToken(newUser.id, tokenId)` | `persistRefreshToken(newUser.id, tokenId, refreshJwt)`    |
| `loginUser`          | 96    | `refreshJwt`    | `persistRefreshToken(user.id, tokenId)`    | `persistRefreshToken(user.id, tokenId, refreshJwt)`       |
| `refreshAccessToken` | 163   | `newRefreshJwt` | `persistRefreshToken(user.id, newTokenId)` | `persistRefreshToken(user.id, newTokenId, newRefreshJwt)` |

### 3. Vérification dans `refreshAccessToken` — comparer le cookie JWT, pas le tokenId

```ts
// ligne 141
// AVANT
const valid = await comparePassword(tokenId, stored.token_hash);
// APRÈS
const valid = await comparePassword(raw, stored.token_hash);
// `raw` = req.cookies?.refreshToken, déjà déclaré ligne 128
```

## Vérification

```bash
grep -rn "persistRefreshToken" backend/src/
```
→ doit n'afficher que `auth.controller.ts`

```bash
cd backend
DATABASE_URL="postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test" \
  npx vitest run --reporter=verbose 2>&1 | tail -30
```
→ tests auth (login, refresh, logout) tous verts
