// Fonction utilitaire générique pour nettoyer un objet
// Supprime toutes les propriétés dont la valeur est "undefined"
export function cleanObject<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  
  // Object.entries(obj) → transforme l'objet en tableau de paires [clé, valeur]
  // .filter(([, value]) => value !== undefined) → garde uniquement les entrées avec une valeur définie
  // Object.fromEntries(...) → reconstruit un nouvel objet à partir des entrées filtrées
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}
