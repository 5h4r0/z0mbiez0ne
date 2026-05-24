// vite-frontend/src/components/manage/ManageTable.tsx
import './manage.css';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  cellClassName?: (row: T) => string;
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

  return (
    <div className="manage-table-wrap">
      <table className="manage-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
            {hasActions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
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
