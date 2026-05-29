import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Props {
  currentFilename: string | null;
  slug: string;
  onUploaded: (filename: string) => void;
  cacheKey?: number;
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

export default function ImageUploadThumb({ currentFilename, slug, onUploaded, cacheKey }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [localVersion, setLocalVersion] = useState(() => Date.now());
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — refresh localVersion when parent busts cache
  useEffect(() => { setLocalVersion(Date.now()); }, [cacheKey]);
  const version = localVersion;
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const blob = await resizeAndConvertWebp(file, 320, 0.80);
      const filename = `${slug}.webp`;
      const fd = new FormData();
      fd.append('filename', filename);
      fd.append('image', blob, filename);
      const res = await apiFetch('/api/upload/activity-thumb', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload échoué');
      setLocalVersion(Date.now());
      onUploaded(filename);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const imgSrc = currentFilename ? `/images/uploads/thumbs/${currentFilename}?v=${version}` : null;

  return (
    <div className="manage-form__thumb-wrapper">
      {imgSrc
        ? <img className="manage-form__thumb" src={imgSrc} alt="Miniature" />
        : <div className="manage-form__thumb-placeholder">Aucune miniature</div>
      }
      <div>
        <button
          type="button"
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? <span className="upload-spinner"><span className="upload-spinner__dot" /> Traitement…</span>
            : (imgSrc ? 'Changer la miniature' : 'Ajouter une miniature')
          }
        </button>
        {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: 4 }}>{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
