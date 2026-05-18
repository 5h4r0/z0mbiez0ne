import { useFetch } from '../hooks/useFetch';
import { type Activity, parsePaginated } from '../types/api';
import SkeletonGrid from './SkeletonGrid';

export default function AllActivities() {
  const { data: raw, loading, error } = useFetch<unknown>('/api/activities');

  if (loading) return <SkeletonGrid />;
  if (error) return <p>Impossible de charger les activités.</p>;

  const { data: activities } = parsePaginated<Activity>(raw ?? []);

  return (
    <section>
      <h2>Activités</h2>
      <div className="card-list">
        {activities.map((activity) => (
          <article key={activity.id} className="card">
            <h3>{activity.title}</h3>
            {activity.description && <p>{activity.description}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
