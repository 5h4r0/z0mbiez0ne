import { useMemo } from 'react';
import { Link } from 'react-router';
import ActivityCard from '../components/home/ActivityCard';
import CategoryCard from '../components/home/CategoryCard';
import SessionCard from '../components/home/SessionCard';
import SkeletonGrid from '../components/SkeletonGrid';
import { useFetch } from '../hooks/useFetch';
import '../styles/HomePage.scss';
import { type Activity, type Category, parsePaginated, type Session } from '../types/api';

export default function HomePage() {
  const { data: sessionsRaw, loading: sessionsLoading, error: sessionsError } = useFetch<unknown>(
    '/api/sessions?status=Scheduled&limit=4&sort=date&order=asc',
  );
  const { data: activitiesRaw, loading: activitiesLoading, error: activitiesError } = useFetch<unknown>(
    '/api/activities?limit=4',
  );
  const { data: categoriesRaw, loading: categoriesLoading, error: categoriesError } = useFetch<unknown>(
    '/api/categories?limit=4',
  );

  const sessions = useMemo(
    () => (sessionsRaw !== null ? parsePaginated<Session>(sessionsRaw).data : []),
    [sessionsRaw],
  );
  const activities = useMemo(
    () => (activitiesRaw !== null ? parsePaginated<Activity>(activitiesRaw).data : []),
    [activitiesRaw],
  );
  const categories = useMemo(
    () => (categoriesRaw !== null ? parsePaginated<Category>(categoriesRaw).data : []),
    [categoriesRaw],
  );

  return (
    <main>
      {/* ——— Hero ——— */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <img className="hero__img" src="/images/sections/hero_text.webp" alt="Malvenue dans la z0mbie z0ne" />

          {/* <p className="hero__pretitle">Malvenue dans la</p>
          <h1 className="hero__title">zØmbie zØne</h1> */}

          <p className="hero__subtitle">
            Vous avez déjà des ennuis<br />Laissez-nous vous aider à votre propre salvation
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

          {sessionsLoading && <SkeletonGrid count={4} gridClass="home-section__grid" />}
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
      <section className="bg-(--color-surface)">
        <div className="home-section">
          <h2 className="home-section__title">LES ÉPREUVES DE LA ZONE</h2>

          {activitiesLoading && <SkeletonGrid count={4} gridClass="home-section__grid" />}
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

          {categoriesLoading && <SkeletonGrid count={4} gridClass="home-section__grid" />}
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
