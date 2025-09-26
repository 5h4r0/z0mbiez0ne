/**
 * Fonction utilitaire générique pour nettoyer un objet.
 *
 * - Supprime toutes les propriétés dont la valeur est `undefined`.
 * - `Object.entries(obj)` transforme l'objet en tableau de paires `[clé, valeur]`.
 * - `.filter(([, value]) => value !== undefined)` garde uniquement les entrées avec une valeur définie.
 * - `Object.fromEntries(...)` reconstruit un nouvel objet à partir des entrées filtrées.
 */

  export function cleanObject<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  ) as T;
}