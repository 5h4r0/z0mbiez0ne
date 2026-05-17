import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface Isessions {
  id: number;
  activity_id: string;
  date: string;
  capacity: number;
  unit_price: number;
  updated_at: string;
}

export default function Sessions() {
  const [sessionsList, setSessionsList] = useState<Isessions[]>([]);
  const [fetchError, setFetchError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions', {
          headers: {},
        });
        const sessionsFromAPI = await response.json();

        console.log('sessionsFromAPI', sessionsFromAPI.data);

        setSessionsList(sessionsFromAPI.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setFetchError('Cannot get sessions');
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (fetchError) {
    return <p>Erreur : {fetchError}</p>;
  }

  return (
    <section>
      <h2>Liste des futures sessions</h2>
      <div className="card-list">
        {sessionsList.map((session) => (
          <article key={session.id} className="card">
            <p>{session.capacity}</p>
            <h3>
              <Link to={`/session/${session.id}`}>{session.date}</Link>
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}
