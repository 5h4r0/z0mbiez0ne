export interface Session {
  id: number;
  activity_id: number;
  date: string;
  date_iso: string;
  capacity: number;
  available_capacity: number;
  unit_price: string;
  status: 'Scheduled' | 'Cancelled' | 'Completed';
  activity?: {
    title: string;
    slug: string;
    image_filename: string;
  };
}

export interface Activity {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_filename: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_filename: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parsePaginated<T>(raw: unknown): { data: T[]; totalPages: number } {
  if (Array.isArray(raw)) return { data: raw as T[], totalPages: 1 };
  const p = raw as PaginatedResponse<T>;
  return { data: p.data ?? [], totalPages: p.totalPages ?? 1 };
}
