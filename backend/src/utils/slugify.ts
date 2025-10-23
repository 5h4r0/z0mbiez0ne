/**
 * src/utils/slugify.ts
 * Transforme une chaîne en slug URL-safe.
 * Exemple : "Événements Spéciaux !" → "evenements-speciaux"
 */
export function makeSlug(input: string): string {
  return input
    .toLowerCase() // tout en minuscules
    .normalize('NFD') // décompose les lettres accentuées (É → E + ´)
    .replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques (accents, tildes…)
    .replace(/[^a-z0-9]+/g, '-') // remplace tout ce qui n'est pas alphanum par un tiret
    .replace(/(^-|-$)+/g, ''); // supprime les tirets au début/fin
}
