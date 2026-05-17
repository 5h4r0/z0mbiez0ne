import { useEffect, useState } from 'react'
import { Link } from 'react-router'

interface ICategory {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<ICategory[]>([]);
  const [fetchError, setFetchError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('./api/categories');
        const data = await response.json();
        setCategoriesList(data.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setFetchError('Impossible de charger les catégories');
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading) return <p>Chargement...</p>;
  if (fetchError) return <p>Erreur : {fetchError}</p>;

  return (
    <main>
      <section>
        <h2>Catégories</h2>
        <div className="card-list">
          {categoriesList.map((category) => (
            <article key={category.id} className="card">
              <h3>
                <Link to={`/categories/${category.slug ?? category.id}`}>{category.name}</Link>
              </h3>
              {category.description && <p>{category.description}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
