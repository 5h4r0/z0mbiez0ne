import { useEffect, useState, type ReactNode } from "react"
// import { Link } from "react-router"


interface IActivityProps {
  title: string;
  description: string;
  image_filename: string;
  slug: string;
  updated_at: string;
  children?: ReactNode;
}

export default function AllActivities() {
  const [activitiesList, setActivitiesList] = useState<IActivityProps>();
  const [fetchError, setFetchError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('./api/', {
          headers: {
          }
        });
        const activitiesFromAPI = await response.json();

        console.log(activitiesFromAPI);

        setActivitiesList(activitiesFromAPI);
      }
      catch (error) {
        console.log(error);
        setFetchError('Cannot get activities');

        console.log(fetchError);
      }
    };
    fetchActivities();
  });


  return (
    <>
      <section>
        <h2>Liste des activités</h2>
        <div className="card">
          <AllActivities />
        </div>
      </section>
    </>
  )
}