# Optimisation tokens Anthropic avec hooks et subagents

## Récap de ce qui a été mis en place aujourd'hui 24/05/2026 :

**CLAUDE.md allégé 365 → 142 lignes**
- .claude/settings.json hooks (db:reset, push --force, reminder db:gen)
- .claude/skills/auth.md
- .claude/skills/prisma-patterns.md
- .claude/skills/deploy-checklist.md

CC est maintenant configuré pour consommer moins de tokens sur zombiezone. Test en conditions réelles dira si les hooks se déclenchent correctement.