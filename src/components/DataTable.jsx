import { useSearchParams } from "react-router-dom";
import { useId, useState } from 'react';
import { Button, CollectionStatus, FormField } from './ui';

const text = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function DataTable({
  caption,
  columns,
  rows,
  loading,
  error,
  reload,
  renderActions,
  filter,
}) {
  const id = useId();
  const [searchParams] = useSearchParams();
  const [localQuery, setQuery] = useState(null);
  const query = localQuery ?? searchParams.get('q') ?? '';
  const [filterValue, setFilterValue] = useState('');
  const [sort, setSort] = useState({ key: columns[0].key, direction: 1 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = rows.filter(
    (row) =>
      columns.some((column) => text(column.value(row)).includes(text(query))) &&
      (!filterValue || filter?.matches(row, filterValue)),
  );
  const column = columns.find((item) => item.key === sort.key) ?? columns[0];
  const sorted = [...filtered].sort((a, b) => {
    const left = column.value(a),
      right = column.value(b);
    return (
      sort.direction *
      (typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), 'pt-BR', { numeric: true }))
    );
  });
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="data-table">
      <div className="table-toolbar">
        <FormField label={`Buscar em ${caption}`}>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </FormField>
        {filter && (
          <FormField label={filter.label}>
            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        )}
        <FormField label="Registros por página">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 25, 50].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </FormField>
      </div>
      <CollectionStatus loading={loading} error={error} reload={reload} />
      {!loading && !error && (
        <>
          <p id={`${id}-scroll`} className="scroll-hint">
            Deslize para ver mais →
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label={caption}
            aria-describedby={`${id}-scroll`}
          >
            <table>
              <caption>{caption}</caption>
              <thead>
                <tr>
                  {columns.map((item) => (
                    <th
                      key={item.key}
                      scope="col"
                      aria-sort={
                        sort.key === item.key
                          ? sort.direction === 1
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <button
                        type="button"
                        className="sort-button"
                        onClick={() =>
                          setSort({
                            key: item.key,
                            direction: sort.key === item.key ? -sort.direction : 1,
                          })
                        }
                      >
                        {item.label}
                        {sort.key === item.key ? (sort.direction === 1 ? ' ↑' : ' ↓') : ' ↕'}
                      </button>
                    </th>
                  ))}
                  {renderActions && <th scope="col">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {visible.length ? (
                  visible.map((row) => (
                    <tr key={row.id}>
                      {columns.map((item) => (
                        <td key={item.key}>
                          {item.render ? item.render(row) : (item.value(row) ?? 'Não informado')}
                        </td>
                      ))}
                      {renderActions && (
                        <td>
                          <div className="row-actions">{renderActions(row)}</div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                      {rows.length
                        ? 'Nenhum resultado para os filtros selecionados.'
                        : 'Nenhum item cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <Button
              variant="secondary"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Anterior
            </Button>
            <span role="status">
              Página {current} de {pages} · {sorted.length} registros
            </span>
            <Button
              variant="secondary"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
