# Prompt CC — Refactorisation styles inline → Tailwind

## Contexte

Tous les composants et pages ont été générés avec des `style={{...}}` inline.
L'objectif est de remplacer **tous** les styles inline par des classes Tailwind,
en conservant les classes SCSS existantes dans `pages.scss` et `HomePage.scss`
(animations, keyframes, BEM — ne pas toucher).

## Stack CSS

- **Tailwind v4** via `@tailwindcss/vite` — `@import "tailwindcss"` dans `App.css`
- Variables CSS dans `App.css` :
  - `--color-bg` `--color-surface` `--color-surface-hover` `--color-border`
  - `--color-red` `--color-red-hover` `--color-gold`
  - `--color-text` `--color-text-muted`
- Police display : `Bebas Neue` — utilisée via `font-family: 'bebas-neue-regular', sans-serif`
- Police body : `Montserrat`

> Tailwind v4 supporte les variables CSS directement :
> `bg-[var(--color-surface)]`, `text-[var(--color-text)]`, `border-[var(--color-border)]`

## Règles de refactorisation

1. **Remplacer tous les `style={{...}}` inline** par des classes Tailwind
2. **Ne pas modifier** `pages.scss`, `HomePage.scss` — ces fichiers restent intacts
3. **Conserver** toutes les classes SCSS existantes (`page-wrapper`, `detail-hero`, `list-page__grid`, `skeleton-card`, `filter-pills`, `pagination`, `static-page`, etc.)
4. **Pas de nouveau fichier SCSS** — Tailwind suffit pour tout le reste
5. Les `onMouseEnter`/`onMouseLeave` inline pour les hovers → remplacer par classes Tailwind `hover:` quand possible, sinon conserver
6. Zéro `any` TypeScript — ne pas dégrader le typage
7. **Ne pas modifier** la logique, les fetch, les états React — uniquement le JSX/styles

## Correspondances de référence

| Style inline fréquent | Classe Tailwind |
|---|---|
| `backgroundColor: 'var(--color-surface)'` | `bg-[var(--color-surface)]` |
| `border: '1px solid var(--color-border)'` | `border border-[var(--color-border)]` |
| `borderRadius: '8px'` | `rounded-lg` |
| `borderRadius: '4px'` | `rounded` |
| `color: 'var(--color-text)'` | `text-[var(--color-text)]` |
| `color: 'var(--color-text-muted)'` | `text-[var(--color-text-muted)]` |
| `color: 'var(--color-red)'` | `text-[var(--color-red)]` |
| `backgroundColor: 'var(--color-red)'` | `bg-[var(--color-red)]` |
| `display: 'flex'` | `flex` |
| `flexDirection: 'column'` | `flex-col` |
| `alignItems: 'center'` | `items-center` |
| `justifyContent: 'space-between'` | `justify-between` |
| `justifyContent: 'center'` | `justify-center` |
| `gap: '16px'` | `gap-4` |
| `gap: '24px'` | `gap-6` |
| `padding: '16px'` | `p-4` |
| `padding: '32px'` | `p-8` |
| `marginBottom: '24px'` | `mb-6` |
| `fontWeight: 700` | `font-bold` |
| `fontSize: '0.875rem'` | `text-sm` |
| `fontSize: '0.9rem'` | `text-sm` |
| `fontSize: '1rem'` | `text-base` |
| `textTransform: 'uppercase'` | `uppercase` |
| `letterSpacing: '0.08em'` | `tracking-widest` |
| `cursor: 'pointer'` | `cursor-pointer` |
| `transition: 'background-color 0.2s'` | `transition-colors duration-200` |
| `textDecoration: 'none'` | `no-underline` |
| `overflow: 'hidden'` | `overflow-hidden` |
| `width: '100%'` | `w-full` |
| `textAlign: 'center'` | `text-center` |
| `position: 'relative'` | `relative` |
| `position: 'absolute'` | `absolute` |
| `minHeight: '100vh'` | `min-h-screen` |
| `flexWrap: 'wrap'` | `flex-wrap` |
| `whiteSpace: 'nowrap'` | `whitespace-nowrap` |
| `textOverflow: 'ellipsis'` | `truncate` |
| `lineHeight: 1.75` | `leading-7` |
| `opacity: 0.6` | `opacity-60` |
| `userSelect: 'none'` | `select-none` |

## Fichiers à refactoriser

### Composants
- `vite-frontend/src/components/Header.tsx`
- `vite-frontend/src/components/Footer.tsx`
- `vite-frontend/src/components/Pagination.tsx`
- `vite-frontend/src/components/home/SessionCard.tsx`
- `vite-frontend/src/components/home/ActivityCard.tsx`
- `vite-frontend/src/components/home/CategoryCard.tsx`

### Pages liste
- `vite-frontend/src/pages/SessionsPage.tsx`
- `vite-frontend/src/pages/ActivitiesPage.tsx`
- `vite-frontend/src/pages/CategoriesPage.tsx`

### Pages détail
- `vite-frontend/src/pages/SessionDetailPage.tsx`
- `vite-frontend/src/pages/ActivityDetailPage.tsx`
- `vite-frontend/src/pages/CategoryDetailPage.tsx`

### Pages spéciales
- `vite-frontend/src/pages/BasketPage.tsx`
- `vite-frontend/src/pages/ContactPage.tsx`
- `vite-frontend/src/pages/NotFoundPage.tsx`

### Pages statiques
- `vite-frontend/src/pages/TarifsPage.tsx`
- `vite-frontend/src/pages/PlanPage.tsx`
- `vite-frontend/src/pages/FaqPage.tsx`
- `vite-frontend/src/pages/MentionsLegalesPage.tsx`
- `vite-frontend/src/pages/CguPage.tsx`
- `vite-frontend/src/pages/ConfidentialitePage.tsx`

### Page accueil
- `vite-frontend/src/pages/HomePage.tsx` — styles inline uniquement,
  conserver toutes les classes SCSS existantes (`hero`, `home-section`, `cta-banner`, etc.)

## À NE PAS modifier

- `vite-frontend/src/styles/pages.scss`
- `vite-frontend/src/pages/HomePage.scss`
- `vite-frontend/src/components/App.css`
- Toute logique TypeScript (fetch, state, handlers)
- Les SVG inline (PlanPage, ContactPage, BasketPage) — conserver tels quels
- Les `<style>` inline dans TarifsPage et ContactPage → les supprimer et migrer en Tailwind

## Grids CSS

Les grids responsives dans `.list-page__grid` et `.home-section__grid` sont déjà
gérées par SCSS — ne pas y toucher.

Pour les grids inline restantes, utiliser Tailwind :

- 3 colonnes fixes : `grid grid-cols-3 gap-6`
- 2 colonnes : `grid grid-cols-2 gap-16`
- Responsive : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Auto-fit : `grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4`

## Validation finale

Après chaque fichier :
```bash
rtk tsc --noEmit
```
Zéro erreur TypeScript requis avant de passer au fichier suivant.
