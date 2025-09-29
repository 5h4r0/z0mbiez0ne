# 🧟 The z0mbie z0ne — Cheatsheet rapide

## ⚡️ Setup initial

```bash
npm install

# Option SQL → Prisma
npm run db:sql
npm run db:pull
npm run db:format
npm run db:gen

# Option Prisma direct
npm run db:create
```

## 🚀 Développement

```bash
npm run dev       # Lancer serveur dev
npm run db:migrate # Migrer après modif schema.prisma
npm run db:seed   # Remplir la DB avec données de test
npm run db:studio # Explorer la DB dans Prisma Studio
```

## 🔄 Reset DB

```bash
npm run db:reset  # Reset complet DB (drop + migrate + seed)
```

## 📦 Production

```bash
npm run db:deploy # Appliquer migrations en prod
npm run build     # Compiler
npm start         # Lancer serveur compilé
```
