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
}

export default function ManageTable<T extends { id: number }>({ columns, data, onEdit, onDelete, rowClassName }: Props<T>) {
  const hasActions = onEdit ?? onDelete;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(col: Column<T>) {
    if (!col.sortable) return;
    const key = col.header;
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
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

  const sorted = sortKey
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
                    {sortKey === col.header ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
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
