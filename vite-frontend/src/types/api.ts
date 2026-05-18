export interface Session {
  id: number;
  activity_id: number;
  date: string;
  capacity: number;
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
