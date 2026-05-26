// vite-frontend/src/components/manage/ManageTable.tsx
import { useState } from 'react';
import './manage.css';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  cellClassName?: (row: T) => string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
}

interface Props<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rowClassName?: (row: T) => string;
  sortKey?: string | null;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void;
}

export default function ManageTable<T extends { id: number }>({ columns, data, onEdit, onDelete, rowClassName, sortKey: extSortKey, sortDir: extSortDir, onSortChange }: Props<T>) {
  const hasActions = onEdit ?? onDelete;
  const [intSortKey, setIntSortKey] = useState<string | null>(null);
  const [intSortDir, setIntSortDir] = useState<'asc' | 'desc'>('asc');

  const isExternal = onSortChange != null;
  const sortKey = isExternal ? (extSortKey ?? null) : intSortKey;
  const sortDir = isExternal ? (extSortDir ?? 'asc') : intSortDir;

  function handleSort(col: Column<T>) {
    if (!col.sortable) return;
    const key = col.header;
    const newDir = sortKey === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    if (isExternal) {
      onSortChange(key, newDir);
    } else {
      setIntSortKey(key);
      setIntSortDir(newDir);
    }
  }

  function getValue(row: T, col: Column<T>): string | number {
    if (col.sortValue) return col.sortValue(row);
    if (col.accessor != null) {
      const v = row[col.accessor];
      return typeof v === 'number' ? v : String(v ?? '');
    }
    return '';
  }

  const sorted = (!isExternal && sortKey)
    ? [...data].sort((a, b) => {
        const col = columns.find((c) => c.header === sortKey);
        if (!col) return 0;
        const va = getValue(a, col);
        const vb = getValue(b, col);
        const cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'fr');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className="manage-table-wrap">
      <table className="manage-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                onClick={() => handleSort(col)}
                style={col.sortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
              >
                {col.header}
                {col.sortable && (
                  <span className="manage-table__sort-icon">
                    {sortKey === col.header ? (sortDir === 'asc' ? ' ▼' : ' ▲') : ' ⇅'}
                  </span>
                )}
              </th>
            ))}
            {hasActions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className={rowClassName?.(row)}>
              {columns.map((col) => (
                <td key={col.header} className={col.cellClassName?.(row)}>
                  {col.render ? col.render(row) : col.accessor != null ? String(row[col.accessor] ?? '') : null}
                </td>
              ))}
              {hasActions && (
                <td>
                  <div className="manage-table__actions">
                    {onEdit && (
                      <button type="button" className="manage-btn manage-btn--ghost" onClick={() => onEdit(row)}>
                        Modifier
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="manage-btn manage-btn--danger" onClick={() => onDelete(row)}>
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
