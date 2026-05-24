# prisma-patterns.md — Conventions Prisma zombiezone
> Charger pour toute tâche Prisma : migrations, requêtes, schema, seeding.

---

## Règles absolues

- **Jamais `SELECT *`** — toujours `select` explicite dans chaque requête
- **Soft delete** : `deleted_at` (NULL = actif) sur `users`, `categories`, `activities`, `sessions`, `orders`
- Filtrer systématiquement : `where: { deleted_at: null }` sur toutes les lectures
- **Pas de `any`** TypeScript — typer avec les types générés par Prisma

---

## Schema — source de vérité

```
backend/src/models/schema.prisma
backend/src/models/migrations/
```

Après toute modif schema :
```bash
npm run db:gen     # régénère le client Prisma
npm run db:dev     # crée + applique la migration (dev)
```

---

## Entités & relations

```
users         → roles (M-1)
users         → RefreshToken (1-N)
users         → orders (1-N)
activities    → activities_categories → categories (M-N)
activities    → sessions (1-N)
sessions      → orders (1-N)
orders        → orders_lines (1-N)
```

Enums :
- `OrderStatus` : Pending / Confirmed / Cancelled / Refunded
- `SessionStatus` : Scheduled / Cancelled / Completed

---

## Patterns requêtes

### Lecture avec soft delete
```ts
await prisma.activity.findMany({
  where: { deleted_at: null },
  select: { id: true, name: true, price: true }
})
```

### Pagination
```ts
// helper : backend/src/helpers/getPagination.ts
const { skip, take } = getPagination(page, limit)
await prisma.activity.findMany({ where: { deleted_at: null }, skip, take })
```

### Soft delete
```ts
await prisma.activity.update({
  where: { id },
  data: { deleted_at: new Date() }
})
```

### Transaction atomique
```ts
await prisma.$transaction([
  prisma.order.update({ where: { id }, data: { status: 'Confirmed' } }),
  prisma.orderLine.updateMany({ where: { order_id: id }, data: { ... } })
])
```

---

## Migrations

```bash
npm run db:dev -- --name <nom_migration>   # dev — crée + applique
npm run db:deploy                          # prod — applique sans prompt
npm run db:reset                           # ⚠️ drop + re-migrate (jamais prod)
```

Nommage migrations : `snake_case` descriptif — ex: `add_refresh_token_hash`, `soft_delete_orders`

---

## Seeding

```bash
npm run db:seed    # données de test
```

Fichier : `backend/src/models/seed.ts`
