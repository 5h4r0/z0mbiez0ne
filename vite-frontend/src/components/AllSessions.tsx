import { useFetch } from '../hooks/useFetch';
import { parsePaginated, type Session } from '../types/api';
import SkeletonGrid from './SkeletonGrid';

export default function AllSessions() {
  const { data: raw, loading, error } = useFetch<unknown>('/api/sessions');

  if (loading) return <SkeletonGrid />;
  if (error) return <p>Impossible de charger les sessions.</p>;

  const { data: sessions } = parsePaginated<Session>(raw ?? []);

  return (
    <section>
      <h2>Liste des futures sessions</h2>
      <div className="card-list">
        {sessions.map((session) => (
          <article key={session.id} className="card">
            <p>{session.capacity}</p>
            <h3>{session.date}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
