import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main>
      <section>
        <h2>404 — Zone introuvable</h2>
        <p>Les zombies ont dévoré cette page.</p>
        <Link to="/">← Retour à l'accueil</Link>
      </section>
    </main>
  );
}
