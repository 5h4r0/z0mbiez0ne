import { useFetch } from '../hooks/useFetch';
import { type Category, parsePaginated } from '../types/api';
import SkeletonGrid from './SkeletonGrid';

export default function AllCategories() {
  const { data: raw, loading, error } = useFetch<unknown>('/api/categories');

  if (loading) return <SkeletonGrid />;
  if (error) return <p>Impossible de charger les catégories.</p>;

  const { data: categories } = parsePaginated<Category>(raw ?? []);

  return (
    <section>
      <h2>Catégories</h2>
      <div className="card-list">
        {categories.map((category) => (
          <article key={category.id} className="card">
            <h3>{category.title}</h3>
            {category.description && <p>{category.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
