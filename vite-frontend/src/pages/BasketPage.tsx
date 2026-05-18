import { Link } from 'react-router';
import { useBasketStore } from '../store/basketStore';
import '../styles/pages.scss';

export default function BasketPage() {
  const { items, removeItem, updateQuantity, clearBasket, totalPrice } = useBasketStore();

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-225">
        <h1 className="static-page__title">VOTRE PANIER</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg viewBox="0 0 200 160" className="w-45 mb-8 opacity-60 mx-auto" aria-hidden="true">
              <rect width="200" height="160" fill="none" />
              <path d="M60 70 L55 110 L145 110 L140 70 Z" fill="none" stroke="#444" strokeWidth="2" />
              <line x1="55" y1="70" x2="145" y2="70" stroke="#444" strokeWidth="2" />
              <path d="M80 70 Q100 45 120 70" fill="none" stroke="#444" strokeWidth="2" />
              <line x1="90" y1="82" x2="110" y2="102" stroke="#555" strokeWidth="1.5" />
              <line x1="110" y1="82" x2="90" y2="102" stroke="#555" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="6" fill="none" stroke="#333" strokeWidth="1.5" />
              <line x1="25" y1="40" x2="55" y2="40" stroke="#333" strokeWidth="1.5" />
              <line x1="40" y1="25" x2="40" y2="55" stroke="#333" strokeWidth="1.5" />
              <circle cx="165" cy="130" r="5" fill="none" stroke="#333" strokeWidth="1.5" />
              <line x1="152" y1="130" x2="178" y2="130" stroke="#333" strokeWidth="1.5" />
              <line x1="165" y1="117" x2="165" y2="143" stroke="#333" strokeWidth="1.5" />
              <circle cx="170" cy="50" r="3" fill="#2a0a0a" />
              <circle cx="30" cy="120" r="2" fill="#2a0a0a" />
            </svg>

            <p className="font-['bebas-neue-regular',sans-serif] text-base text-(--color-text) mb-3">
              Votre panier est vide.
            </p>
            <p className="text-(--color-text-muted) text-sm italic mb-8">Les zombies, eux, n'attendent pas.</p>
            <Link
              to="/sessions"
              className="bg-(--color-red) text-white no-underline px-7 py-3 rounded font-bold text-sm tracking-[0.06em] uppercase"
            >
              Voir les sessions
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.sessionId}
                  className="bg-(--color-surface) border border-(--color-border) rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-(--color-text) truncate">{item.activityTitle}</p>
                    <p className="text-sm text-(--color-text-muted)">{formatDate(item.date)}</p>
                    <p className="text-sm text-(--color-text-muted)">€{item.unitPrice.toFixed(2)} / place</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Réduire la quantité"
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.sessionId, item.quantity - 1)
                          : removeItem(item.sessionId)
                      }
                      className="bg-(--color-border) border-none text-(--color-text) w-8 h-8 rounded cursor-pointer text-base"
                    >
                      −
                    </button>
                    <span className="text-[1.1rem] font-bold text-(--color-text) min-w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      onClick={() => updateQuantity(item.sessionId, item.quantity + 1)}
                      className="bg-(--color-border) border-none text-(--color-text) w-8 h-8 rounded cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-(--color-red) text-[1.1rem] min-w-16 text-right">
                      €{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Supprimer ${item.activityTitle}`}
                      onClick={() => removeItem(item.sessionId)}
                      className="bg-transparent border-none text-(--color-text-muted) hover:text-(--color-red) cursor-pointer text-lg transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mb-8">
              <button
                type="button"
                onClick={clearBasket}
                className="bg-transparent border-none text-(--color-text-muted) hover:text-(--color-red) cursor-pointer text-sm underline transition-colors duration-200"
              >
                Vider le panier
              </button>
            </div>

            <div className="border-t border-(--color-border) pt-6 flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-(--color-text-muted)">Total : </span>
                <span className="text-2xl font-bold text-(--color-red)">€{totalPrice().toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={() => console.log('TODO: commander', items)}
                className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-8 py-3 rounded text-sm font-bold cursor-pointer uppercase tracking-[0.06em] transition-colors duration-200"
              >
                Commander
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
