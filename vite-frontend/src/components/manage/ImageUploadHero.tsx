import { useRef, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Props {
  currentFilename: string | null;
  slug: string;
  onUploaded: (filename: string) => void;
}

async function resizeAndConvertWebp(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('conversion failed')); return; }
        resolve(blob);
      }, 'image/webp', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ImageUploadHero({ currentFilename, slug, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const blob = await resizeAndConvertWebp(file, 1200, 0.70);
      const filename = `activity-${slug}.webp`;
      const fd = new FormData();
      fd.append('image', blob, filename);
      fd.append('filename', filename);
      const res = await apiFetch('/api/upload/activity-banner', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload échoué');
      onUploaded(filename);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const imgSrc = currentFilename ? `/images/banners/${currentFilename}` : null;

  return (
    <button
      type="button"
      className="manage-form__hero"
      onClick={() => inputRef.current?.click()}
    >
      {imgSrc
        ? <img src={imgSrc} alt="Bannière" />
        : (
          <div className="manage-form__hero-placeholder">
            <span>🖼</span>
            <span>Aucune bannière — cliquer pour ajouter</span>
          </div>
        )
      }
      <div className="manage-form__hero-overlay">
        {uploading
          ? <span className="upload-spinner"><span className="upload-spinner__dot" /> Traitement…</span>
          : <button type="button" className="manage-form__hero-btn">
              {imgSrc ? 'Changer la bannière' : 'Ajouter une bannière'}
            </button>
        }
      </div>
      {error && <p style={{ position: 'absolute', bottom: 4, left: 12, color: 'red', fontSize: '0.8rem' }}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </button>
  );
}
