import React from 'react';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Spinner } from './Loader';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortConfig = { key: null, direction: 'asc' },
  onSort,
  pagination = { currentPage: 1, totalPages: 1, onPageChange: () => {} },
  onRowClick,
  emptyMessage = 'No records found',
  actionsHeader = 'Actions',
}) => {
  const handleSort = (key, sortable) => {
    if (!sortable || !onSort) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSort({ key, direction });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card flex flex-col">
      <div className="overflow-x-auto no-scrollbar">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-6 py-4.5 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700 ' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size="lg" />
                    <span className="text-sm font-medium text-slate-500">
                      Fetching records...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-50/60 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap"
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-105 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{pagination.currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-250 bg-white text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-subtle"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-250 bg-white text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-subtle"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
