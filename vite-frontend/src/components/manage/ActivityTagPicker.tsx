import { useEffect, useState } from 'react';
import { apiFetch } from '../../store/authStore';

interface Activity { id: number; title: string; }

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
  multi?: boolean;
}

export default function ActivityTagPicker({ selected, onChange, multi = true }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/activities?limit=100')
      .then(r => r.json())
      .then(d => setActivities(Array.isArray(d) ? d : (d.data ?? [])))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: number) {
    if (multi) {
      onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  }

  if (loading) return <p className="tag-picker__loading">Chargement…</p>;

  return (
    <div className="tag-picker">
      {activities.map(act => (
        <button
          key={act.id}
          type="button"
          className={`tag-picker__tag${selected.includes(act.id) ? ' tag-picker__tag--selected' : ''}`}
          onClick={() => toggle(act.id)}
        >
          {act.title}
        </button>
      ))}
    </div>
  );
}
