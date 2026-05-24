#!/usr/bin/env bash
# setup-ai.sh — Configure CC + claude.ai pour un nouveau projet
# Usage : bash setup-ai.sh [--project-name "Mon Projet"] [--repo-url "https://github.com/..."]
# Place ce script à la racine du repo et lance-le une fois par projet.
set -e

# ─── Couleurs ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── Args ────────────────────────────────────────────────────
PROJECT_NAME="${1:-$(basename "$(pwd)")}"
REPO_URL="${2:-}"
BRANCH="${3:-main}"

# Auto-detect repo URL depuis git remote
if [ -z "$REPO_URL" ]; then
  REPO_URL=$(git remote get-url origin 2>/dev/null | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//' || echo "")
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         setup-ai — Project AI Config         ║"
echo "╚══════════════════════════════════════════════╝"
echo "  Project : $PROJECT_NAME"
echo "  Repo    : ${REPO_URL:-unknown}"
echo "  Branch  : $BRANCH"
echo ""

# ─── 1. gstack — install global si absent ────────────────────
echo "── 1/3 gstack"
GSTACK_DIR="$HOME/.claude/skills/gstack"

if [ -d "$GSTACK_DIR" ]; then
  log "gstack déjà installé dans $GSTACK_DIR"
else
  log "Installation de gstack..."
  git clone --depth 1 https://github.com/garrytan/gstack.git "$HOME/.claude/skills/gstack-src"
  cd "$HOME/.claude/skills/gstack-src"
  if command -v bun >/dev/null 2>&1; then
    ./setup
    log "gstack installé avec Bun"
  else
    warn "Bun non installé — gstack installé en mode lecture seule (sans browse binary)"
    mkdir -p "$HOME/.claude/skills"
    ln -snf "$HOME/.claude/skills/gstack-src" "$GSTACK_DIR"
  fi
  cd - > /dev/null
fi

# ─── 2. CLAUDE.md — ajouter section auth & sécurité si absent ─
echo ""
echo "── 2/3 CLAUDE.md"
CLAUDE_MD="$(pwd)/CLAUDE.md"

if [ ! -f "$CLAUDE_MD" ]; then
  warn "CLAUDE.md absent — création d'un fichier minimal"
  cat > "$CLAUDE_MD" << EOF
# CLAUDE.md
> Contexte pour Claude Code — référence de session

## Project
$PROJECT_NAME

## gstack
Use \`/browse\` from gstack for all web browsing. Never use \`mcp__claude-in-chrome__*\` tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /review, /ship, /browse, /qa, /qa-only, /design-review, /retro, /investigate, /document-release, /codex, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade
EOF
  log "CLAUDE.md créé"
else
  # Vérifier si la section sécurité est déjà présente
  if grep -q "Règles auth & sécurité" "$CLAUDE_MD" 2>/dev/null; then
    log "Section sécurité déjà présente dans CLAUDE.md"
  else
    cat >> "$CLAUDE_MD" << 'EOF'

---

## Règles auth & sécurité (non négociables)

### JWT — stockage des tokens
- **Jamais** de token en `localStorage` ou `sessionStorage` → vulnérable XSS
- **accessToken** : cookie `httpOnly`, `secure`, `sameSite: 'strict'`, `path: '/'`
- **refreshToken** : cookie `httpOnly`, `secure`, `sameSite: 'strict'`, `path: '/api/auth/refresh'`

### JWT — implémentation backend
- `cookie-parser` monté **avant** toutes les routes
- CORS : `credentials: true` + origines explicites
- RefreshToken en BDD : stocker `token_id` (UUID) + hash argon2 — lookup O(1), DELETE atomique
- `logoutUser` : `clearCookie` dans `finally` — toujours exécuté
- Distinguer `TokenExpiredError` vs `JsonWebTokenError` dans le middleware auth

### JWT — implémentation frontend
- `credentials: 'include'` sur tous les fetch auth
- Flag `isRefreshing` dans `apiFetch` pour éviter boucle infinie
- Pages protégées : vérification réseau au montage (protection bfcache)
- `sameSite: 'strict'` + `Cache-Control: no-store` sur routes protégées

### Avant tout code important
- Lire `~/.claude/skills/gstack/review/specialists/security.md`
- Lire `~/.claude/skills/gstack/review/specialists/performance.md`
- Appliquer `/review` + `/investigate` avant tout debug
EOF
    log "Section sécurité ajoutée à CLAUDE.md"
  fi
fi

# ─── 3. CLAUDE_AI.md — créer ou mettre à jour ────────────────
echo ""
echo "── 3/3 CLAUDE_AI.md"
CLAUDE_AI_MD="$(pwd)/CLAUDE_AI.md"

cat > "$CLAUDE_AI_MD" << EOF
# CLAUDE_AI.md
> Référence de session pour claude.ai — décisions validées, règles projet, patterns approuvés.
> Cloner au début de chaque discussion importante.

---

## Accès au repo

\`\`\`bash
git clone ${REPO_URL:-https://github.com/OWNER/REPO}.git
cd $(basename "${REPO_URL:-project}" .git) && git checkout $BRANCH
\`\`\`

Toujours cloner et lire les fichiers concernés avant d'analyser ou proposer une correction.

---

## Accès à gstack (skills Garry Tan / YC)

\`\`\`bash
git clone --depth 1 https://github.com/garrytan/gstack.git /tmp/gstack
\`\`\`

Lire et appliquer les skills pertinents avant toute réponse sur : sécurité, architecture,
review de code, debug, performance, UX.

### Skills à appliquer par contexte

| Contexte | Skills |
|----------|--------|
| Sécurité / auth | \`/review\` + \`review/specialists/security.md\` |
| Performance | \`/review\` + \`review/specialists/performance.md\` |
| Modification endpoint | \`/review\` + \`review/specialists/api-contract.md\` |
| Tests | \`/review\` + \`review/specialists/testing.md\` |
| Architecture | \`/plan-eng-review\` |
| Debug | \`/investigate\` (Iron Law : pas de fix sans root cause) |
| Tout diff important | \`review/checklist.md\` Pass 1 CRITICAL |

---

## Règles de réponse

- Toujours préfixer les fichiers de code avec leur chemin relatif au monorepo
- Appliquer les bonnes pratiques d'office — ne pas attendre qu'on les demande
- En fin de réponse sur un sujet important : proposer de mettre à jour CLAUDE_AI.md

---

## Auth JWT — règles absolues

### Stockage
- **accessToken** : cookie \`httpOnly; Secure; SameSite=Strict; path=/; maxAge=15min\`
- **refreshToken** : cookie \`httpOnly; Secure; SameSite=Strict; path=/api/auth/refresh; maxAge=7j\`
- **Jamais** localStorage, sessionStorage, ou variable persistée entre sessions

### Backend
- \`cookie-parser\` avant toutes les routes
- CORS : \`credentials: true\` + origines explicites
- RefreshToken : \`token_id\` UUID dans le cookie + hash argon2 en BDD
- DELETE atomique + vérif \`rowCount === 1\` (protection race condition)
- Nettoyage tokens expirés à chaque refresh
- \`clearCookie\` dans \`finally\` de logoutUser
- Distinguer \`TokenExpiredError\` vs \`JsonWebTokenError\`

### Frontend
- \`credentials: 'include'\` sur tous les fetch auth
- Flag \`isRefreshing\` dans \`apiFetch\`
- Guard réseau au montage des pages protégées
- \`Cache-Control: no-store\` sur routes protégées (bfcache)

---

## Stack decisions (à compléter par projet)

Voir \`CLAUDE.md\`.

---

## Décisions validées

<!-- Ajouter ici au fil des sessions : patterns approuvés, bugs résolus, choix d'archi -->

EOF

log "CLAUDE_AI.md créé/mis à jour"

# ─── Résumé ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║                    Done ✓                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Fichiers créés/mis à jour :"
echo "    $(pwd)/CLAUDE.md"
echo "    $(pwd)/CLAUDE_AI.md"
echo ""
echo "  gstack : $GSTACK_DIR"
echo ""
echo "  Prochaine étape :"
echo "    git add CLAUDE.md CLAUDE_AI.md"
echo "    git commit -m 'docs: 📚 add AI config files (CLAUDE.md + CLAUDE_AI.md)'"
echo ""
