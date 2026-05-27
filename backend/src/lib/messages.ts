export type Action = 'created' | 'updated' | 'deleted';
export type Entity = 'activity' | 'category' | 'session' | 'order' | 'order_line' | 'user';
export type ErrorType =
  | 'not_found'
  | 'already_exists'
  | 'has_orders'
  | 'has_sessions'
  | 'has_order_lines'
  | 'has_orphan_activities'
  | 'has_linked_activities'
  | 'invalid_id'
  | 'invalid_categories'
  | 'not_pending'
  | 'invalid_status_transition'
  | 'insufficient_capacity'
  | 'internal_error';

type Locale = 'fr';

const LOCALE: Locale = 'fr';

// ─── CUD templates ────────────────────────────────────────────────────────────

const cudTemplates: Record<Locale, Record<Entity, Record<Action, string>>> = {
  fr: {
    activity: {
      created: 'L\'activité "{name}" a été créée',
      updated: 'L\'activité "{name}" a été mise à jour',
      deleted: 'L\'activité "{name}" a été supprimée',
    },
    category: {
      created: 'La catégorie "{name}" a été créée',
      updated: 'La catégorie "{name}" a été mise à jour',
      deleted: 'La catégorie "{name}" a été supprimée',
    },
    session: {
      created: 'La session "{name}" a été créée',
      updated: 'La session "{name}" a été mise à jour',
      deleted: 'La session "{name}" a été supprimée',
    },
    order: {
      created: 'La commande "{name}" a été créée',
      updated: 'La commande "{name}" a été mise à jour',
      deleted: 'La commande "{name}" a été supprimée',
    },
    order_line: {
      created: 'La ligne de commande "{name}" a été créée',
      updated: 'La ligne de commande "{name}" a été mise à jour',
      deleted: 'La ligne de commande "{name}" a été supprimée',
    },
    user: {
      created: 'L\'utilisateur "{name}" a été créé',
      updated: 'L\'utilisateur "{name}" a été mis à jour',
      deleted: 'L\'utilisateur "{name}" a été supprimé',
    },
  },
};

// ─── Error templates ───────────────────────────────────────────────────────────

const errorTemplates: Record<Locale, Record<Entity, Partial<Record<ErrorType, string>>>> = {
  fr: {
    activity: {
      not_found: 'L\'activité "{id}" n\'existe pas',
      already_exists: 'L\'activité "{id}" existe déjà',
      has_orders: 'L\'activité "{id}" ne peut pas être supprimée car elle a des commandes associées',
      has_sessions: 'L\'activité "{id}" ne peut pas être supprimée car elle a des sessions associées',
      has_order_lines: 'L\'activité "{id}" ne peut pas être supprimée car elle a des lignes de commande associées',
      invalid_id: 'L\'identifiant activité "{id}" est invalide',
      invalid_categories: 'L\'activité "{id}" référence des catégories invalides',
      internal_error: "Une erreur interne est survenue lors du traitement de l'activité",
    },
    category: {
      not_found: 'La catégorie "{id}" n\'existe pas',
      already_exists: 'La catégorie "{id}" existe déjà',
      has_orphan_activities:
        'La catégorie "{id}" ne peut pas être supprimée car des activités en dépendent exclusivement',
      has_linked_activities: 'Cette catégorie ne peut pas être supprimée car des activités y sont rattachées.',
      invalid_id: 'L\'identifiant catégorie "{id}" est invalide',
      internal_error: 'Une erreur interne est survenue lors du traitement de la catégorie',
    },
    session: {
      not_found: 'La session "{id}" n\'existe pas',
      has_order_lines: 'La session "{id}" ne peut pas être supprimée car elle a des lignes de commande associées',
      insufficient_capacity: 'La session "{id}" n\'a pas assez de capacité disponible',
      internal_error: 'Une erreur interne est survenue lors du traitement de la session',
    },
    order: {
      not_found: 'La commande "{id}" n\'existe pas',
      not_pending: 'La commande "{id}" ne peut pas être modifiée car elle n\'est pas en attente',
      invalid_status_transition: 'La transition de statut de la commande "{id}" est invalide',
      internal_error: 'Une erreur interne est survenue lors du traitement de la commande',
    },
    order_line: {
      not_found: 'La ligne de commande "{id}" n\'existe pas',
      not_pending:
        'La ligne de commande "{id}" ne peut pas être modifiée car la commande associée n\'est pas en attente',
      internal_error: 'Une erreur interne est survenue lors du traitement de la ligne de commande',
    },
    user: {
      not_found: 'L\'utilisateur "{id}" n\'existe pas',
      already_exists: 'L\'email "{id}" est déjà utilisé',
      has_orders: 'L\'utilisateur "{id}" ne peut pas être supprimé car il a des commandes associées',
      invalid_id: 'L\'identifiant utilisateur "{id}" est invalide',
      internal_error: "Une erreur interne est survenue lors du traitement de l'utilisateur",
    },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildCategoryClause(categories: string[], _locale: Locale): string {
  if (categories.length === 0) return '';
  if (categories.length === 1) return ` dans la catégorie "${categories[0]}"`;
  const last = categories[categories.length - 1];
  const rest = categories
    .slice(0, -1)
    .map((c) => `"${c}"`)
    .join(', ');
  return ` dans les catégories ${rest} et "${last}"`;
}

export function buildCudMessage(
  action: Action,
  entity: Entity,
  name: string,
  options?: { categories?: string[] },
): string {
  const base = cudTemplates[LOCALE][entity][action].replace('{name}', name);
  const categoryClause = options?.categories?.length ? buildCategoryClause(options.categories, LOCALE) : '';
  return base + categoryClause;
}

export function buildErrorMessage(errorType: ErrorType, entity: Entity, identifier?: string | string[]): string {
  const id = Array.isArray(identifier) ? identifier[0] : identifier;
  const template = errorTemplates[LOCALE][entity][errorType];
  if (!template) return 'Une erreur interne est survenue';
  return id ? template.replace('{id}', id) : template.replace(/ ?"\{id\}"/, '');
}
