Applique les fixes suivants. Lis chaque fichier avant de le modifier.

---

## FIX-1 — ImageUploadHero.tsx + ImageUploadThumb.tsx : FormData order + suppression préfixe hardcodé

Dans les deux composants, deux corrections simultanées :

1. Inverser l'ordre des fd.append (filename AVANT image) :
   fd.append('filename', filename);
   fd.append('image', blob, filename);

2. Supprimer le préfixe `activity-` hardcodé — utiliser `slug` brut :
   const filename = `${slug}.webp`;   // ← était `activity-${slug}.webp`

Le slug avec préfixe est désormais géré par les parents (voir FIX-2).

---

## FIX-2 — ManageActivityFormPage.tsx : ajouter préfixe `activity-` dans le slug passé aux composants upload

Les deux composants ImageUploadHero et ImageUploadThumb reçoivent actuellement `slug={slug || slugify(title)}` (sans préfixe). Après FIX-1, ils n'ajoutent plus de préfixe — il faut donc l'ajouter ici.

Remplacer les deux occurrences :
  slug={slug || slugify(title)}
par :
  slug={`activity-${slug || slugify(title)}`}

Note : ManageCategoryFormPage passe déjà `slug={`category-${slugForUpload}`}` — rien à changer.

---

## FIX-3 — ManageActivityFormPage.tsx + ManageCategoryFormPage.tsx : thumbFilename dans le payload

Convention retenue : banner et thumb ont le MÊME nom de fichier, stocké dans `image_filename`.
Quand une miniature est uploadée séparément, son filename doit écraser `bannerFilename` (même nom, dossier différent).

Dans les deux pages, remplacer le callback `onUploaded` du composant ImageUploadThumb :
  onUploaded={setThumbFilename}
par :
  onUploaded={f => { setThumbFilename(f); setBannerFilename(f); }}

Cela garantit que `image_filename` dans le payload reflète toujours le dernier fichier uploadé (banner ou thumb).

---

## FIX-4 — activities.controller.ts : getActivityById — ajouter slug et image_filename dans la réponse

Dans la fonction getActivityById (route GET /activities/:id), le bloc `data: { ... }` n'inclut pas `slug` ni `image_filename`.

Ajouter ces deux champs dans la réponse :
  slug: activity.slug,
  image_filename: activity.image_filename,

---

## FIX-5 — ImageUploadHero.tsx : <button> imbriqué dans <button>

Après le fix biome (div → button extérieur), le composant a un <button> externe `.manage-form__hero` qui contient un <button> interne `.manage-form__hero-btn`. HTML invalide.

Remplacer le <button> interne `.manage-form__hero-btn` par un <span className="manage-form__hero-btn">.

---

## FIX-6 — app.ts : express.static pour les images

Ajouter le middleware static AVANT la déclaration du router /api :

import path from 'node:path';
app.use('/images', express.static(path.resolve('..', 'vite-frontend', 'public', 'images')));

Vérifier que `path` n'est pas déjà importé avant d'ajouter l'import.

---

## FIX-7 — manage.ts : unit_price z.string() → z.number()

Dans sessionFormSchema, corriger :
  unit_price: z.string().min(1, 'Prix requis'),
en :
  unit_price: z.number().min(0, 'Prix invalide'),

---

## Vérification finale

cd vite-frontend && npx biome check src/
# Attendu : 0 errors, 0 warnings

Vérifier aussi que le backend compile sans erreur :
cd ../backend && npm run build