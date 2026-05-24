// vite-frontend/src/components/manage/ConfirmModal.tsx
import { useEffect, useRef, useState } from 'react';
import './manage.css';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
  error?: string;
}

export default function ConfirmModal({ isOpen, title, message, onCancel, onConfirm, danger = false, error }: Props) {
  const [staged, setStaged] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Reset staged + focus quand le modal se ferme
  useEffect(() => {
    if (!isOpen) setStaged(false);
  }, [isOpen]);

  // Reset staged quand une erreur arrive (suppression impossible)
  useEffect(() => {
    if (error) setStaged(false);
  }, [error]);

  // Focus trap — bouton "Valider" à l'ouverture (si pas d'erreur bloquante)
  useEffect(() => {
    if (isOpen && !error) confirmBtnRef.current?.focus();
  }, [isOpen, error]);

  // Escape ferme
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setStaged(false); onCancel(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  function handleCancel() {
    setStaged(false);
    onCancel();
  }

  return (
    <div
      className="manage-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div className="manage-modal">
        <div id="confirm-modal-title" className="manage-modal__title">{title}</div>
        <div className="manage-modal__message">{message}</div>

        {/* Cas erreur : suppression impossible */}
        {error && (
          <>
            <div className="manage-modal__warning" style={{ color: '#d4a017' }}>
              Pour supprimer cette catégorie, vous devez soit retirer les activités suivantes de la catégorie, soit les supprimer.
            </div>
            <div className="manage-error" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {error}
            </div>
          </>
        )}

        {/* Cas normal : avertissement staged confirm */}
        {staged && !error && (
          <div className="manage-modal__warning">
            {danger ? '⚠️ Cette action est irréversible. Confirmez-vous ?' : 'Êtes-vous sûr ?'}
          </div>
        )}

        <div className="manage-modal__footer">
          <button type="button" className="manage-btn manage-btn--ghost" onClick={handleCancel}>
            Annuler
          </button>
          {!error && (
            !staged ? (
              <button ref={confirmBtnRef} type="button" className="manage-btn manage-btn--ghost" onClick={() => setStaged(true)}>
                Valider
              </button>
            ) : (
              <button
                ref={confirmBtnRef}
                type="button"
                className={`manage-btn ${danger ? 'manage-btn--danger' : 'manage-btn--primary'}`}
                onClick={onConfirm}
              >
                Confirmer
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
