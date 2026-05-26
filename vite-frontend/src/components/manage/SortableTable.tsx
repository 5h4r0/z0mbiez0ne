import { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function SortableTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'Aucune donnée.',
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'fr', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  if (rows.length === 0) {
    return <p className="sortable-table--empty">{emptyMessage}</p>;
  }

  return (
    <div className="sortable-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={[
                  col.sortable ? 'sortable' : '',
                  sortKey === String(col.key) ? 'sort-active' : '',
                ].join(' ')}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
              >
                {col.label}
                {col.sortable && (
                  <span className="sort-icon">
                    {sortKey === String(col.key) ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row) : String(row[String(col.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
