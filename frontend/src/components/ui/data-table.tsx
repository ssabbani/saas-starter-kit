"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  mobileCard?: (row: T) => React.ReactNode;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  emptyMessage = "No data found",
  mobileCard,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortFn) return data;
    const mult = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => mult * col.sortFn!(a, b));
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePageIndex = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize,
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${mobileCard ? "hidden md:block" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                      col.hideOnMobile ? "hidden lg:table-cell" : ""
                    } ${col.sortable ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="text-slate-300">
                          {sortKey === col.key && sortDir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-indigo-500" />
                          ) : sortKey === col.key && sortDir === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5 text-indigo-500" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageData.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm ${
                        col.hideOnMobile ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {pageData.map((row, i) => (
            <div
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {mobileCard(row)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {safePageIndex * pageSize + 1}–
            {Math.min((safePageIndex + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <PaginationBtn
              onClick={() => setPage(0)}
              disabled={safePageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationBtn>
            <PaginationBtn
              onClick={() => setPage(safePageIndex - 1)}
              disabled={safePageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationBtn>
            <span className="px-3 text-xs font-medium text-slate-700">
              {safePageIndex + 1} / {totalPages}
            </span>
            <PaginationBtn
              onClick={() => setPage(safePageIndex + 1)}
              disabled={safePageIndex >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationBtn>
            <PaginationBtn
              onClick={() => setPage(totalPages - 1)}
              disabled={safePageIndex >= totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
