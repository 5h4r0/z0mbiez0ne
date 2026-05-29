// vite-frontend/src/types/manage.ts
import { z } from 'zod';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
export type SessionStatus = 'Scheduled' | 'Cancelled' | 'Completed';

export interface ManageUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  deleted_at: string | null;
  role: string | null;
}

export interface ManageOrder {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  payment_method: string | null;
  payment_date: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ManageOrderLine {
  id: number;
  order_id: number;
  session_id: number;
  tickets_qty: number;
  amount: number;
}

export interface ManageSession {
  id: number;
  activity_id: number;
  date: string;
  date_iso: string;
  capacity: number;
  available_capacity: number;
  unit_price: number;
  status: SessionStatus;
  activity?: { title: string; slug: string } | null;
}

export interface ManageActivity {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_filename: string;
  categories?: { id: number; title: string }[];
  sessions_count?: number;
}

export interface ManageCategory {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_filename: string;
  activities: { id: number; title: string; slug: string }[];
}

// Schémas Zod formulaires
export const activityFormSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().min(1, 'Description requise'),
  activities_categories: z.array(z.number()).min(1, 'Au moins une catégorie requise'),
});

export const categoryFormSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  image_filename: z.string().min(1, 'Image requise'),
});

export const sessionFormSchema = z.object({
  activity_id: z.number({ message: 'Activité requise' }),
  date: z.string().min(1, 'Date requise'),
  capacity: z.number().min(1, 'Capacité min. 1'),
  unit_price: z.number().min(0, 'Prix invalide'),
  status: z.enum(['Scheduled', 'Cancelled', 'Completed']),
});

export const orderStatusFormSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Refunded']),
});

// Schémas Zod parse réponses API
export const manageUserSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  created_at: z.string(),
  deleted_at: z.string().nullable(),
  role: z.string().nullable(),
});

export const manageOrderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Refunded']),
  total_amount: z.number(),
  payment_method: z.string().nullable(),
  payment_date: z.string().nullable(),
  created_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const manageActivitySchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  image_filename: z.string(),
  categories: z.array(z.object({ id: z.number(), title: z.string() })).optional(),
  sessions_count: z.number().optional(),
});

export const manageCategorySchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  image_filename: z.string(),
  activities_count: z.number().optional(),
  activities: z.array(z.object({ id: z.number(), title: z.string(), slug: z.string() })),
});

export const manageSessionSchema = z.object({
  id: z.number(),
  activity_id: z.number(),
  date: z.string(),
  capacity: z.number(),
  available_capacity: z.number(),
  date_iso: z.string(),
  unit_price: z.number(),
  status: z.enum(['Scheduled', 'Cancelled', 'Completed']),
  activity: z.object({ title: z.string(), slug: z.string() }).nullable().optional(),
});
