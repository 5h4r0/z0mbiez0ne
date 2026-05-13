import { useEffect, useState } from "react"
import { Link } from "react-router"


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
        const response = await fetch('./api/activities', {
          headers: {
          }
        });
        const activitiesFromAPI = await response.json();

        console.log("activitiesFromAPI", activitiesFromAPI.data);

        setActivitiesList(activitiesFromAPI.data ?? []);
        setIsLoading(false);
      }
      catch (error) {
        console.log(error);
        setFetchError('Cannot get activities');
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (fetchError) {
    return <p>Erreur : {fetchError}</p>;
  }

  return (
    <section>
      <h2>Liste des activités</h2>
      <div className="card-list">
        {activitiesList.map((activity) => (
          <article key={activity.id} className="card">
            <h3>
              <Link to={`/activities/${activity.slug}`}>{activity.title}</Link>
            </h3>
            <p>{activity.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}