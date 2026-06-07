# MODE AUTONOME — exécuter sans validation intermédiaire
Appliquer toutes les tâches en séquence. Ne pas demander confirmation.
Prendre la meilleure décision technique et continuer. Résumé final uniquement.

Branche : customer-account-dev
Vérifier : test -d /tmp/zz && echo exists || (git clone https://github.com/5h4r0/z0mbiez0ne.git /tmp/zz -q && cd /tmp/zz && git checkout customer-account-dev)

---

# CONTEXTE

Projet fullstack TypeScript monorepo — backend Express 5 + Prisma, frontend React 19 + Vite + Tailwind 4 + SCSS.
Images : vite-frontend/public/images/uploads/banners/ et /thumbs/ — noms comme activity-cabane-du-boucher.webp
Auth : JWT httpOnly cookie uniquement. apiFetch() depuis authStore gère le 401/refresh. Admin = role_id === 2.
Routes admin backend existantes :
  GET/POST   /api/activities          — POST body: { title, description, activities_categories: number[] }
  PUT/DELETE /api/activities/:id      — PUT body: { title, description, activities_categories: number[] }
  GET/POST   /api/categories          — POST body: { title, description }
  PUT/DELETE /api/categories/:id
  GET/POST   /api/sessions            — POST body: { activity_id, date (ISO), capacity, unit_price, status }
  PUT/DELETE /api/sessions/:id
  GET        /api/orders              — admin
  GET        /api/users               — admin

---

# ÉTAPE 0 — MIGRATION PRISMA

Dans backend/src/models/schema.prisma, changer le type description pour activities ET categories :
  Avant : description  String?  @db.VarChar(2000)
  Après : description  String?  @db.Text

Créer la migration :
  cd backend && npm run db:dev -- --name description_text

Régénérer le client Prisma :
  npm run db:gen

---

# ÉTAPE 1 — BACKEND : controller categories — support activities_ids

Dans backend/src/controllers/categories.controller.ts :

Modifier createCategory et updateCategory pour accepter un champ optionnel activities_ids: number[].

Pour createCategory :
  - Si activities_ids fourni et non vide : créer les entrées activities_categories en même temps
  - Utiliser prisma.categories.create avec include activities_categories → activity

Pour updateCategory :
  - Si activities_ids fourni : deleteMany activities_categories WHERE category_id = id, puis recréer
  - Valider que les activity ids existent (findMany + diff) → 400 si invalides
  - Même pattern que updateActivity côté activities_categories

Modifier le router categories si nécessaire (aucun changement de route, juste body étendu).

---

# ÉTAPE 2 — BACKEND : upload images

Installer dans backend/ :
  npm install multer
  npm install --save-dev @types/multer

Créer backend/src/routers/upload.router.ts :

```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

function makeStorage(subdir: 'banners' | 'thumbs') {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.resolve('..', 'vite-frontend', 'public', 'images', subdir));
    },
    filename: (req, _file, cb) => {
      const filename = (req.body.filename as string) || `upload-${Date.now()}.webp`;
      cb(null, filename);
    },
  });
}

const uploadBanner = multer({ storage: makeStorage('banners') });
const uploadThumb  = multer({ storage: makeStorage('thumbs') });

router.post(
  '/upload/activity-banner',
  requireAuth,
  requireRole('admin'),
  uploadBanner.single('image'),
  (req, res) => {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file' }); return; }
    res.json({ success: true, filename: req.file.filename });
  },
);

router.post(
  '/upload/activity-thumb',
  requireAuth,
  requireRole('admin'),
  uploadThumb.single('image'),
  (req, res) => {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file' }); return; }
    res.json({ success: true, filename: req.file.filename });
  },
);
```

Monter dans backend/src/routers/index.router.ts :
  import { router as uploadRouter } from './upload.router.js';
  app.use('/api', uploadRouter);  // ou selon le pattern existant d'index.router

---

# ÉTAPE 3 — DÉPENDANCES FRONTEND

Dans vite-frontend/ :
  npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link browser-image-compression

---

# ÉTAPE 4 — STYLES

Créer vite-frontend/src/styles/manage.scss :

```scss
// ——— Layout pages manage ———
.manage-page {
  padding: 80px 24px 80px;
  max-width: 1400px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
    gap: 16px;
  }

  &__title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: clamp(1.2rem, 2.5vw, 1.6rem);
    color: var(--color-text);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

// ——— Hub ———
.manage-hub__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}

.manage-hub__card {
  display: block;
  text-decoration: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 28px 24px;
  transition: border-color 0.2s, transform 0.15s;

  &:hover {
    border-color: var(--color-red);
    transform: translateY(-2px);
  }

  &-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--color-text);
    margin: 0 0 8px;
  }

  &-desc {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  &-count {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-red);
    font-family: 'Montserrat', sans-serif;
    margin-bottom: 8px;
  }
}

.manage-add__section {
  margin-top: 0;

  &-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }
}

.manage-add__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.manage-add__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 18px;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;

  &:hover {
    border-color: var(--color-red);
    color: var(--color-red);
    background: rgba(var(--color-red-rgb, 180 0 0) / 0.06);
  }
}

// ——— Formulaires ———
.manage-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;

  &__section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--color-border);

    &-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--color-text-muted);
      margin-bottom: 24px;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;
  }

  &__label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--color-text-muted);
  }

  &__input {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--color-text);
    font-size: 0.9rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--color-red);
    }

    &::placeholder {
      color: var(--color-text-muted);
    }

    &--error {
      border-color: var(--color-red);
    }
  }

  &__field-error {
    font-size: 0.78rem;
    color: var(--color-red);
    margin-top: 2px;
  }

  &__hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  // Hero banner zone
  &__hero {
    position: relative;
    height: 280px;
    border-radius: 10px;
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    cursor: pointer;
    margin-bottom: 32px;

    &:hover .manage-form__hero-overlay { opacity: 1; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      flex-direction: column;
      gap: 12px;
    }
  }

  &__hero-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: flex-end;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &__hero-btn {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 0.85rem;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.2s;

    &:hover { background: rgba(255,255,255,0.25); }
  }

  // Thumb
  &__thumb-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 8px;
  }

  &__thumb {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__thumb-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    border: 1px dashed var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    flex-shrink: 0;
  }
}

// ——— SortableTable ———
.sortable-table {
  overflow-x: auto;
  width: 100%;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--color-text-muted);
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
    user-select: none;

    &.sortable {
      cursor: pointer;
      &:hover { color: var(--color-text); }
    }

    .sort-icon {
      margin-left: 4px;
      opacity: 0.3;
      font-size: 0.7rem;
    }

    &.sort-active {
      color: var(--color-text);
      .sort-icon { opacity: 1; color: var(--color-red); }
    }
  }

  td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
    color: var(--color-text);
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--color-surface); }

  &--empty {
    text-align: center;
    padding: 48px 0;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
}

// ——— TipTap ———
.tiptap-editor {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within { border-color: var(--color-red); }

  &__toolbar {
    display: flex;
    gap: 4px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
    background: var(--color-surface);
  }

  &__btn {
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 0.78rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover, &--active {
      border-color: var(--color-red);
      color: var(--color-text);
    }
  }

  .ProseMirror {
    padding: 12px 14px;
    min-height: 160px;
    outline: none;
    color: var(--color-text);
    font-size: 0.9rem;
    line-height: 1.65;

    p { margin: 0 0 8px; }
    ul, ol { padding-left: 20px; margin: 0 0 8px; }
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: var(--color-text-muted);
      pointer-events: none;
      float: left;
      height: 0;
    }
  }

  &__counter {
    text-align: right;
    font-size: 0.72rem;
    color: var(--color-text-muted);
    padding: 4px 10px 6px;
    border-top: 1px solid var(--color-border);

    &--warn { color: orange; }
    &--error { color: var(--color-red); }
  }
}

// ——— TagPicker ———
.tag-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__tag {
    display: inline-flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 0.82rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    user-select: none;

    &:hover { border-color: var(--color-red); color: var(--color-text); }

    &--selected {
      background: var(--color-red);
      border-color: var(--color-red);
      color: #fff;
    }
  }

  &__loading {
    font-size: 0.82rem;
    color: var(--color-text-muted);
  }
}

// ——— Badge statuts ———
.badge-status {
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;

  &--scheduled  { color: #60a5fa; background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96,165,250,0.3); }
  &--completed  { color: var(--color-text-muted); background: var(--color-surface); border: 1px solid var(--color-border); }
  &--cancelled  { color: var(--color-red); background: rgba(var(--color-red-rgb, 180 0 0) / 0.1); border: 1px solid rgba(var(--color-red-rgb, 180 0 0) / 0.3); }
  &--pending    { color: #fb923c; background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.3); }
  &--confirmed  { color: #4ade80; background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.3); }
  &--refunded   { color: var(--color-text-muted); background: var(--color-surface); border: 1px solid var(--color-border); }
}

// ——— Boutons génériques (manage) ———
.btn-primary {
  background: var(--color-red);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 22px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: .04em;
  cursor: pointer;
  transition: opacity 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 22px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, color 0.2s;

  &:hover { border-color: var(--color-text-muted); color: var(--color-text); }
}

.btn-danger {
  background: transparent;
  color: var(--color-red);
  border: 1px solid var(--color-red);
  border-radius: 6px;
  padding: 10px 22px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover { background: var(--color-red); color: #fff; }
}

// ——— Toast message succès ———
.manage-toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: #166534;
  border: 1px solid #4ade80;
  color: #4ade80;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 0.875rem;
  z-index: 1000;
  animation: toast-in 0.25s ease;

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}

// ——— Upload spinner ———
.upload-spinner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted);

  &__dot {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-red);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}
```

---

# ÉTAPE 5 — COMPOSANTS RÉUTILISABLES

## vite-frontend/src/components/manage/SortableTable.tsx

```tsx
import { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function SortableTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'Aucune donnée.',
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'fr', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  if (rows.length === 0) {
    return <p className="sortable-table--empty">{emptyMessage}</p>;
  }

  return (
    <div className="sortable-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={[
                  col.sortable ? 'sortable' : '',
                  sortKey === String(col.key) ? 'sort-active' : '',
                ].join(' ')}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
              >
                {col.label}
                {col.sortable && (
                  <span className="sort-icon">
                    {sortKey === String(col.key) ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row) : String(row[String(col.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## vite-frontend/src/components/manage/TipTapEditor.tsx

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TipTapEditor({ value, onChange, placeholder = 'Description…', maxLength = 2000 }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value]);

  const htmlLen = editor?.getHTML().length ?? 0;
  const counterClass = htmlLen > maxLength
    ? 'tiptap-editor__counter--error'
    : htmlLen > maxLength * 0.9
    ? 'tiptap-editor__counter--warn'
    : '';

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-editor__toolbar">
        {[
          { label: 'G', title: 'Gras', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
          { label: 'I', title: 'Italique', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
          { label: '• Liste', title: 'Liste à puces', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
          { label: '1. Liste', title: 'Liste numérotée', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        ].map(btn => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            className={`tiptap-editor__btn${btn.active ? ' tiptap-editor__btn--active' : ''}`}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          title="Lien"
          className={`tiptap-editor__btn${editor.isActive('link') ? ' tiptap-editor__btn--active' : ''}`}
          onClick={() => {
            const url = window.prompt('URL', editor.getAttributes('link').href ?? '');
            if (url === null) return;
            if (url === '') { editor.chain().focus().unsetLink().run(); return; }
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          🔗
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className={`tiptap-editor__counter ${counterClass}`}>
        {htmlLen} / {maxLength} {htmlLen > maxLength && '— trop long, raccourcir avant d\'enregistrer'}
      </div>
    </div>
  );
}
```

## vite-frontend/src/components/manage/CategoryTagPicker.tsx

```tsx
import { useEffect, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Category { id: number; title: string; }

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function CategoryTagPicker({ selected, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/categories?limit=100')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  if (loading) return <p className="tag-picker__loading">Chargement…</p>;

  return (
    <div className="tag-picker">
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          className={`tag-picker__tag${selected.includes(cat.id) ? ' tag-picker__tag--selected' : ''}`}
          onClick={() => toggle(cat.id)}
        >
          {cat.title}
        </button>
      ))}
    </div>
  );
}
```

## vite-frontend/src/components/manage/ActivityTagPicker.tsx

```tsx
import { useEffect, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Activity { id: number; title: string; }

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
  multi?: boolean;
}

export default function ActivityTagPicker({ selected, onChange, multi = true }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/activities?limit=100')
      .then(r => r.json())
      .then(d => setActivities(Array.isArray(d) ? d : (d.data ?? [])))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: number) {
    if (multi) {
      onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  }

  if (loading) return <p className="tag-picker__loading">Chargement…</p>;

  return (
    <div className="tag-picker">
      {activities.map(act => (
        <button
          key={act.id}
          type="button"
          className={`tag-picker__tag${selected.includes(act.id) ? ' tag-picker__tag--selected' : ''}`}
          onClick={() => toggle(act.id)}
        >
          {act.title}
        </button>
      ))}
    </div>
  );
}
```

## vite-frontend/src/components/manage/ImageUploadHero.tsx

```tsx
import { useRef, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Props {
  currentFilename: string | null;
  slug: string;
  onUploaded: (filename: string) => void;
}

async function resizeAndConvertWebp(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('conversion failed')); return; }
        resolve(blob);
      }, 'image/webp', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ImageUploadHero({ currentFilename, slug, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const blob = await resizeAndConvertWebp(file, 1200, 0.70);
      const filename = `activity-${slug}.webp`;
      const fd = new FormData();
      fd.append('image', blob, filename);
      fd.append('filename', filename);
      const res = await apiFetch('/api/upload/activity-banner', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload échoué');
      onUploaded(filename);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const imgSrc = currentFilename ? `/images/uploads/banners/${currentFilename}` : null;

  return (
    <div
      className="manage-form__hero"
      onClick={() => inputRef.current?.click()}
    >
      {imgSrc
        ? <img src={imgSrc} alt="Bannière" />
        : (
          <div className="manage-form__hero-placeholder">
            <span>🖼</span>
            <span>Aucune bannière — cliquer pour ajouter</span>
          </div>
        )
      }
      <div className="manage-form__hero-overlay">
        {uploading
          ? <span className="upload-spinner"><span className="upload-spinner__dot" /> Traitement…</span>
          : <button type="button" className="manage-form__hero-btn">
              {imgSrc ? 'Changer la bannière' : 'Ajouter une bannière'}
            </button>
        }
      </div>
      {error && <p style={{ position: 'absolute', bottom: 4, left: 12, color: 'red', fontSize: '0.8rem' }}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
```

## vite-frontend/src/components/manage/ImageUploadThumb.tsx

Identique à ImageUploadHero avec :
- maxWidth = 320 au lieu de 1200
- endpoint : /api/upload/activity-thumb
- classe manage-form__thumb au lieu de manage-form__hero
- Affichage : img 120×120 avec classe manage-form__thumb + placeholder manage-form__thumb-placeholder
- Pas d'overlay hover — bouton "Changer la miniature" en dessous de l'image

---

# ÉTAPE 6 — PAGES MANAGE

## Utilitaire slugify (vite-frontend/src/utils/slugify.ts)

```typescript
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
```

## Guard admin réutilisable (vite-frontend/src/components/manage/AdminGuard.tsx)

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';

interface Props { children: React.ReactNode; }

export default function AdminGuard({ children }: Props) {
  const { user, isHydrating } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHydrating && (!user || user.role_id !== 2)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isHydrating, navigate]);

  if (isHydrating) {
    return (
      <div className="page-wrapper" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Vérification des droits…</p>
      </div>
    );
  }

  if (!user || user.role_id !== 2) return null;
  return <>{children}</>;
}
```

## Toast hook (vite-frontend/src/hooks/useToast.ts)

```typescript
import { useState, useCallback } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');

  const toast = useCallback((msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  return { message, toast };
}
```

## ManageHubPage.tsx

Route /manage
Importe : AdminGuard, manage.scss
Liens cards vers : /manage/activites, /manage/categories, /manage/sessions, /manage/commandes, /manage/utilisateurs
Section manage-add__grid avec liens : /manage/activites/nouvelle, /manage/categories/nouvelle, /manage/sessions/nouvelle

## ManageActivitiesPage.tsx

Route /manage/activites
GET /api/activities?limit=100
SortableTable colonnes : Titre(sortable), Slug(sortable), Catégories(render: tags séparés par virgule), Sessions(count, sortable sur nb sessions), Mise à jour(sortable), Actions(Éditer→navigate, Supprimer→confirm+DELETE)
Bouton "+ Nouvelle activité" → /manage/activites/nouvelle

## ManageActivityFormPage.tsx

Route /manage/activites/nouvelle et /manage/activites/:id
Mode détecté par useParams().id
Si édition : GET /api/activities/:id → pré-remplir titre, slug, description, categories ids, image_filename
Champs dans l'ordre :
  1. ImageUploadHero (banner)
  2. Titre — input, onChange → si !slugLocked: setSlug(slugify(value))
  3. Slug — input, onChange → setSlugLocked(true)
     Hint : {slugLocked ? '✏️ personnalisé' : '🔗 synchronisé avec le titre'}
  4. Description — TipTapEditor (max 2000 chars HTML)
  5. Catégories — CategoryTagPicker
  6. ImageUploadThumb (thumb)
  En mode édition seulement :
  7. Section SESSIONS — SessionsTable (SortableTable) + bouton nouvelle session
  8. Section BILLETS VENDUS — SortableTable (données depuis activity.sessions.users)
Boutons : Annuler | Enregistrer | Supprimer(édition)
Payload POST: { title, slug, description, activities_categories: number[] }
Payload PUT: { title, slug, description, activities_categories: number[] }
Note : le backend updateActivity utilise makeSlug(title) — modifier le controller pour accepter un slug explicite en body si fourni, sinon fallback makeSlug(title)

IMPORTANT : modifier backend/src/controllers/activities.controller.ts createActivity et updateActivity pour accepter slug en body (optionnel), image_filename en body (optionnel, pour mettre à jour après upload).

## ManageCategoriesPage.tsx

Route /manage/categories
Identique ManageActivitiesPage structure mais pour categories
GET /api/categories?limit=100
SortableTable colonnes : Titre, Slug, Activités(count), Mise à jour, Actions

## ManageCategoryFormPage.tsx

Route /manage/categories/nouvelle et /manage/categories/:id
Identique ManageActivityFormPage mais :
- Pas de section sessions ni utilisateurs
- CategoryTagPicker remplacé par ActivityTagPicker (multi) pour les activités associées
  Note : gestion en lecture partielle — voir TODO dans le code
  Le PUT /api/categories/:id supporte maintenant activities_ids (étape 1)
- Images : préfixe category-{slug}.webp, endpoints upload identiques (réutiliser les mêmes /api/upload/activity-banner et /api/upload/activity-thumb — le nom du fichier généré suffit à distinguer)

## ManageSessionsPage.tsx

Route /manage/sessions
GET /api/sessions?limit=200
SortableTable colonnes : Date(sortable), Activité(sortable), Capacité(sortable), Prix(sortable), Statut(badge+sortable), Actions(Éditer, Supprimer)
Bouton "+ Nouvelle session"

## ManageSessionFormPage.tsx

Route /manage/sessions/nouvelle et /manage/sessions/:id
Si query param ?activity_id → pré-sélectionner dans le select activité
Champs :
  1. Activité — select (GET /api/activities?limit=100)
  2. Date/heure — input type="datetime-local" className="manage-form__input"
  3. Capacité — input number, validation ≥ 1, message erreur rouge sous le champ
  4. Prix unitaire — input number step="0.01", validation ≥ 0
  5. Statut — select (Scheduled/Cancelled/Completed avec labels FR)
En mode édition : section COMMANDES (OrdersTable, filtre Confirmed|Pending)
Payload : { activity_id, date: new Date(dateInput).toISOString(), capacity, unit_price, status }

## ManageOrdersPage.tsx

Route /manage/commandes
GET /api/orders
SortableTable colonnes : ID(sortable), Utilisateur(prénom+nom), Activité(s)(premiere ligne), Montant(sortable), Statut(badge+sortable), Date(sortable), Voir(lien /dashboard/commandes/:id)

## ManageUsersPage.tsx

Route /manage/utilisateurs
GET /api/users
SortableTable colonnes : ID(sortable), Prénom(sortable, vert si role_id===2), Nom(sortable, vert si role_id===2), Email(sortable), Rôle(admin/membre), Inscrit le(sortable), Statut(Actif/Supprimé via deleted_at)

---

# ÉTAPE 7 — WIRING App.tsx

Ajouter toutes les routes /manage/* avec AdminGuard enveloppant chaque page.
Alternativement, utiliser un Route parent /manage/* avec AdminGuard dans un layout.

Routes :
  /manage → ManageHubPage
  /manage/activites → ManageActivitiesPage
  /manage/activites/nouvelle → ManageActivityFormPage
  /manage/activites/:id → ManageActivityFormPage
  /manage/categories → ManageCategoriesPage
  /manage/categories/nouvelle → ManageCategoryFormPage
  /manage/categories/:id → ManageCategoryFormPage
  /manage/sessions → ManageSessionsPage
  /manage/sessions/nouvelle → ManageSessionFormPage
  /manage/sessions/:id → ManageSessionFormPage
  /manage/commandes → ManageOrdersPage
  /manage/utilisateurs → ManageUsersPage

---

# ÉTAPE 8 — LIEN DEPUIS LE HEADER OU DASHBOARD

Dans vite-frontend/src/components/Header.tsx :
  Si user?.role_id === 2, ajouter un lien "BACKOFFICE" → /manage dans la navigation.

Dans vite-frontend/src/pages/dashboard/DashboardPage.tsx :
  Si user?.role_id === 2, ajouter un bouton/lien "Accéder au backoffice" → /manage.

---

# ÉTAPE 9 — VÉRIFICATION FINALE

1. npm run build dans backend/ — doit compiler sans erreur TypeScript
2. npm run build dans vite-frontend/ — doit compiler sans erreur TypeScript
3. Si erreurs : corriger avant de terminer

---

# RÉSUMÉ ATTENDU EN FIN D'EXÉCUTION

Lister :
- Fichiers créés
- Fichiers modifiés
- Migrations appliquées
- Dépendances installées
- Erreurs éventuelles restantes
