# Prompt CC — Patch `sessions.controller.ts`

## Contexte

`GET /api/sessions` ignore actuellement tous les query params sauf `limit`/`offset` (via `getPagination`).
Le frontend envoie `?status=Scheduled&activity_slug=chambre-des-tortures&limit=4&sort=date&order=asc` — tout est ignoré.
`GET /api/sessions/:id` ne retourne pas l'activité imbriquée — le frontend ne peut pas afficher le titre ni l'image sur la page détail session.

## Fichier à modifier

`backend/src/controllers/sessions.controller.ts`

---

## Modification 1 — `getSessions` : supporter les query params de filtrage

Remplacer le `paginationSchema` et la construction des `args` par ce qui suit.

### Query params à supporter

| Param | Type | Description |
|---|---|---|
| `limit` | string → number | Déjà géré par `getPagination` via `take` |
| `offset` | string → number | Déjà géré par `getPagination` via `skip` |
| `page` | string → number | Optionnel : si présent, calculer `skip = (page-1) * take` |
| `status` | `'Scheduled' \| 'Cancelled' \| 'Completed'` | Filtrer par statut |
| `activity_slug` | string | Filtrer par slug de l'activité liée |
| `sort` | `'date' \| 'id'` | Champ de tri (défaut : `date`) |
| `order` | `'asc' \| 'desc'` | Ordre de tri (défaut : `asc`) |

### Zod schema

```ts
const querySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  page: z.string().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  activity_slug: z.string().optional(),
  sort: z.enum(['date', 'id']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
```

### Logique `where`

```ts
const query = await querySchema.parseAsync(req.query);

const where: Prisma.sessionsWhereInput = {};
if (query.status) where.status = query.status;
if (query.activity_slug) where.activity = { slug: query.activity_slug };
```

### Logique pagination

`getPagination` gère déjà `limit` → `take` et `offset` → `skip`.
Si `page` est présent et `take` est défini : `skip = (Number(query.page) - 1) * take`.

```ts
const { take, skip: skipFromOffset } = getPagination(req);
const skipFromPage =
  query.page && take ? (Number(query.page) - 1) * take : undefined;
const skip = skipFromOffset ?? skipFromPage;
```

### Logique orderBy

```ts
const orderBy: Prisma.sessionsOrderByWithRelationInput = {
  [query.sort ?? 'date']: query.order ?? 'asc',
};
```

### Include : ajouter `activity`

Dans le `include` de `findMany`, ajouter :
```ts
activity: {
  select: { id: true, title: true, slug: true, image_filename: true },
},
```

### Réponse formatée

Ajouter `activity_id` et `activity` dans le `map` :
```ts
const formatted = sessions.map((s) => ({
  id: s.id,
  activity_id: s.activity_id,
  activity: s.activity ?? null,
  date: formatDate(new Date(s.date)),
  capacity: s.capacity,
  unit_price: Number(s.unit_price),
  status: s.status,
  users: s.orders_lines.map((ol) => ol.order.user),
}));
```

---

## Modification 2 — `getSession` : inclure l'activité imbriquée

Dans `getSession`, ajouter `activity` dans le `include` :

```ts
const args = {
  where: { id: Number(id) },
  include: {
    activity: {
      select: { id: true, title: true, slug: true, image_filename: true },
    },
    orders_lines: {
      include: {
        order: {
          include: {
            user: {
              select: { id: true, email: true, firstname: true, lastname: true },
            },
          },
        },
      },
    },
  },
};
```

Dans la réponse `data`, ajouter :
```ts
activity_id: session.activity_id,
activity: session.activity ?? null,
```

---

## Conventions du projet (rappel)

- Pas de `any`
- Guard clauses
- `??` plutôt que `||`
- Zod sur tous les inputs

## Ce que tu ne dois PAS modifier

- `createSession`, `updateSession`, `deleteSession` — ne pas toucher
- `formatSession` helper — ne pas toucher
- `sessions.router.ts` — ne pas toucher
- Aucun autre fichier
