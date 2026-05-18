import { Link } from 'react-router';
import '../styles/pages.scss';

export default function NotFoundPage() {
  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center text-center px-6">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          8%        { opacity: 0.85; }
          9%        { opacity: 1; }
          42%       { opacity: 1; }
          43%       { opacity: 0.7; }
          44%       { opacity: 1; }
          70%       { opacity: 1; }
          71%       { opacity: 0.8; }
          72%       { opacity: 1; }
        }
        .notfound-404 { animation: flicker 4s infinite; }
      `}</style>

      <p className="notfound-404 font-black text-[clamp(6rem,20vw,14rem)] text-(--color-red) leading-none mb-4 select-none font-['bebas-neue-regular',sans-serif]">
        404
      </p>

      <p className="font-bold text-[clamp(1rem,3vw,1.4rem)] text-(--color-text) mb-6 tracking-[0.05em] font-['bebas-neue-regular',sans-serif]">
        Zone introuvable
      </p>

      <p className="text-(--color-text-muted) text-base italic mb-10 max-w-[400px]">
        Cette page a été dévorée par les zombies.
      </p>

      <Link
        to="/"
        className="bg-(--color-red) hover:bg-(--color-red-hover) text-white no-underline px-7 py-3 rounded font-bold text-sm tracking-[0.06em] uppercase transition-colors duration-200"
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
}
