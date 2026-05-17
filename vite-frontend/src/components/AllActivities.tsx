import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface IActivities {
  id: number;
  title: string;
  description: string;
  image_filename: string;
  slug: string;
  updated_at: string;
}

export default function Activities() {
  const [activitiesList, setActivitiesList] = useState<IActivities[]>([]);
  const [fetchError, setFetchError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        setActivitiesList(data.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setFetchError('Impossible de charger les activités');
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (isLoading) return <p>Chargement...</p>;
  if (fetchError) return <p>Erreur : {fetchError}</p>;

  return (
    <section>
      <h2>Activités</h2>
      <div className="card-list">
        {activitiesList.map((activity) => (
          <article key={activity.id} className="card">
            <h3>
              <Link to={`/activities/${activity.slug}`}>{activity.title}</Link>
            </h3>
            {activity.description && <p>{activity.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
