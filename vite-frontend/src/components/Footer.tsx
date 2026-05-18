import { Link } from 'react-router';

function ZombieLogoFooter() {
  return (
    <Link to="/" className="no-underline inline-block mb-3">
      <span className="font-['bebas-neue-regular',sans-serif] font-bold text-base text-(--color-gold) tracking-[0.01em] whitespace-nowrap">
        the <span className="text-(--color-red)">zØmbie</span> zØne
      </span>
    </Link>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-(--color-text-muted) hover:text-(--color-text) no-underline text-sm transition-colors duration-200 block mb-2"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ label, path }: { label: string; path: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="bg-transparent border-none cursor-pointer p-0 text-(--color-text-muted) hover:text-(--color-text) transition-colors duration-200"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </button>
  );
}

const FB_PATH =
  'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z';
const IG_PATH =
  'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
const YT_PATH =
  'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-(--color-border)">
      <div className="max-w-350 mx-auto px-6 pt-16 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Col 1 — Brand */}
        <div>
          <ZombieLogoFooter />
          <p className="text-[0.85rem] text-(--color-text-muted) mb-1.5 leading-relaxed">
            Parc à zombies réservé aux vivants
          </p>
          <p className="text-[0.85rem] text-(--color-text-muted) mb-1.5">Nîmes, France, avant l'apocalypse</p>
          <p className="text-[0.85rem] text-(--color-text-muted) mb-4">Visitez nos pages sur les réseaux</p>
          <div className="flex gap-4">
            <SocialIcon label="Facebook" path={FB_PATH} />
            <SocialIcon label="Instagram" path={IG_PATH} />
            <SocialIcon label="YouTube" path={YT_PATH} />
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <h3 className="font-bold text-sm text-(--color-text) mb-4 tracking-widest uppercase">Navigation</h3>
          <FooterLink to="/les-epreuves">Activités</FooterLink>
          <FooterLink to="/sessions">Sessions</FooterLink>
          <FooterLink to="/categories-epreuves">Catégories</FooterLink>
          <FooterLink to="/plan">Plan</FooterLink>
          <FooterLink to="/tarifs">Tarifs</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
        </div>

        {/* Col 3 — Légal */}
        <div>
          <h3 className="font-bold text-sm text-(--color-text) mb-4 tracking-widest uppercase">Au cas où</h3>
          <FooterLink to="/mentions-legales">Mentions Légales</FooterLink>
          <FooterLink to="/cgu">CGU</FooterLink>
          <FooterLink to="/confidentialite">Confidentialité</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </div>

        {/* Col 4 — Newsletter */}
        <div>
          <h3 className="font-bold text-sm text-(--color-text) mb-4 tracking-widest uppercase">Newsletter</h3>
          <p className="text-[0.85rem] text-(--color-text-muted) mb-3">Abonnez-vous</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="newsletter-email" className="text-[0.8rem] text-(--color-text-muted)">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="votre@email.fr"
              className="bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-(--color-text) text-sm outline-none w-full"
            />
            <button
              type="button"
              className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none rounded px-4 py-2 text-sm font-semibold cursor-pointer tracking-[0.04em] transition-colors duration-200"
            >
              S'abonner
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-(--color-border) text-center px-6 py-4 text-xs text-(--color-text-muted)">
        © {new Date().getFullYear()} The Z0mbie Z0ne. Tous droits réservés.
      </div>
    </footer>
  );
}
