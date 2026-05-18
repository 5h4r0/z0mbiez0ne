import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ActivityCard from '../components/home/ActivityCard';
import CategoryCard from '../components/home/CategoryCard';
import SessionCard from '../components/home/SessionCard';
import type { Activity, Category, Session } from '../types/api';
import './HomePage.scss';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__img" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--medium" />
        <div className="skeleton-card__line skeleton-card__line--full" />
        <div className="skeleton-card__line skeleton-card__line--short" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="home-section__grid">
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [sessionsError, setSessionsError] = useState(false);
  const [activitiesError, setActivitiesError] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);

  useEffect(() => {
    fetch('/api/sessions?status=Scheduled&limit=4&sort=date&order=asc')
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : ((data as { data?: Session[] }).data ?? []);
        setSessions(rows as Session[]);
      })
      .catch(() => setSessionsError(true))
      .finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/activities?limit=4')
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : ((data as { data?: Activity[] }).data ?? []);
        setActivities(rows as Activity[]);
      })
      .catch(() => setActivitiesError(true))
      .finally(() => setActivitiesLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/categories?limit=4')
      .then((r) => r.json())
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : ((data as { data?: Category[] }).data ?? []);
        setCategories(rows as Category[]);
      })
      .catch(() => setCategoriesError(true))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <main>
      {/* ——— Hero ——— */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <p className="hero__pretitle">Malvenue dans la</p>
          <h1 className="hero__title">zØmbie zØne</h1>
          <p className="hero__subtitle">
            Vous avez déjà des ennuis, alors laissez-nous vous aider à votre propre salvation.
          </p>
          <Link to="/sessions" className="hero__cta">
            S'inscrire et venir !
          </Link>
        </div>
      </section>

      {/* ——— Sessions ——— */}
      <section>
        <div className="home-section">
          <h2 className="home-section__title">PROCHAINES SESSIONS</h2>

          {sessionsLoading && <SkeletonGrid />}
          {sessionsError && <p className="home-section__error">Les sessions ne sont pas disponibles pour le moment.</p>}
          {!sessionsLoading && !sessionsError && (
            <div className="home-section__grid">
              {sessions.map((s, i) => (
                <SessionCard key={s.id} session={s} index={i} />
              ))}
            </div>
          )}

          <div className="home-section__more">
            <Link to="/sessions">→ Voir toutes les sessions</Link>
          </div>
        </div>
      </section>

      {/* ——— Activités ——— */}
      <section className="bg-[var(--color-surface)]">
        <div className="home-section">
          <h2 className="home-section__title">LES ÉPREUVES DE LA ZONE</h2>

          {activitiesLoading && <SkeletonGrid />}
          {activitiesError && (
            <p className="home-section__error">Les épreuves ne sont pas disponibles pour le moment.</p>
          )}
          {!activitiesLoading && !activitiesError && (
            <div className="home-section__grid">
              {activities.map((a, i) => (
                <ActivityCard key={a.id} activity={a} index={i} />
              ))}
            </div>
          )}

          <div className="home-section__more">
            <Link to="/les-epreuves">→ Découvrir toutes les épreuves</Link>
          </div>
        </div>
      </section>

      {/* ——— Catégories ——— */}
      <section>
        <div className="home-section">
          <h2 className="home-section__title">EXPLOREZ NOS CATÉGORIES</h2>

          {categoriesLoading && <SkeletonGrid />}
          {categoriesError && (
            <p className="home-section__error">Les catégories ne sont pas disponibles pour le moment.</p>
          )}
          {!categoriesLoading && !categoriesError && (
            <div className="home-section__grid">
              {categories.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
          )}

          <div className="home-section__more">
            <Link to="/categories-epreuves">→ Parcourir toutes les catégories</Link>
          </div>
        </div>
      </section>

      {/* ——— CTA Bandeau ——— */}
      <section className="cta-banner">
        <div className="cta-banner__bg" />
        <div className="cta-banner__content">
          <h2 className="cta-banner__title">Trouvez votre chemin parmi les activités du parc</h2>
          <Link to="/les-epreuves" className="cta-banner__btn">
            Je veux savoir comment survivre !
          </Link>
        </div>
      </section>
    </main>
  );
}
