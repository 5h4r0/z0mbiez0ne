import { useEffect, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Category { id: number; title: string; }

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function CategoryTagPicker({ selected, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/categories?limit=100')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  if (loading) return <p className="tag-picker__loading">Chargement…</p>;

  return (
    <div className="tag-picker">
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          className={`tag-picker__tag${selected.includes(cat.id) ? ' tag-picker__tag--selected' : ''}`}
          onClick={() => toggle(cat.id)}
        >
          {cat.title}
        </button>
      ))}
    </div>
  );
}
