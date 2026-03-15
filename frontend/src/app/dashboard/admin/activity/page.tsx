"use client";

import { api } from "@/lib/api";
import type { AdminActivity } from "@/lib/types";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { useDebounce } from "@/lib/use-debounce";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const actionStyles: Record<string, string> = {
  login: "bg-blue-100 text-blue-700",
  signup: "bg-green-100 text-green-700",
  password_change: "bg-amber-100 text-amber-700",
  password_reset: "bg-amber-100 text-amber-700",
  api_key_created: "bg-indigo-100 text-indigo-700",
  api_key_revoked: "bg-red-100 text-red-700",
  subscription_created: "bg-purple-100 text-purple-700",
  subscription_updated: "bg-purple-100 text-purple-700",
  settings_updated: "bg-slate-100 text-slate-700",
};

function formatTimestamp(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [actionFilter, setActionFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await api.get<{ logs: AdminActivity[] }>(
        "/api/admin/activity?per_page=100",
      );
      setActivities(Array.isArray(data.logs) ? data.logs : []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchActivities, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchActivities]);

  const actionTypes = useMemo(() => {
    const set = new Set(activities.map((a) => a.action));
    return Array.from(set).sort();
  }, [activities]);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (
        search &&
        !a.user_email.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (actionFilter !== "all" && a.action !== actionFilter) return false;
      return true;
    });
  }, [activities, search, actionFilter]);

  const columns: Column<AdminActivity>[] = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        render: (a) => (
          <span className="text-sm text-slate-700">{a.user_email}</span>
        ),
        sortable: true,
        sortFn: (a, b) => a.user_email.localeCompare(b.user_email),
      },
      {
        key: "action",
        header: "Action",
        render: (a) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${actionStyles[a.action] || "bg-slate-100 text-slate-600"}`}
          >
            {a.action.replace(/_/g, " ")}
          </span>
        ),
        sortable: true,
        sortFn: (a, b) => a.action.localeCompare(b.action),
      },
      {
        key: "detail",
        header: "Detail",
        render: (a) => (
          <span className="text-sm text-slate-600">{a.detail}</span>
        ),
      },
      {
        key: "ip",
        header: "IP Address",
        render: (a) => (
          <span className="font-mono text-xs text-slate-400">
            {a.ip_address || "—"}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "timestamp",
        header: "Timestamp",
        render: (a) => (
          <span className="text-xs text-slate-500">
            {formatTimestamp(a.created_at)}
          </span>
        ),
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        hideOnMobile: true,
      },
    ],
    [],
  );

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user email..."
            aria-label="Search activity"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            autoRefresh
              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <RefreshCw
            className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
            style={autoRefresh ? { animationDuration: "3s" } : undefined}
          />
          {autoRefresh ? "Auto-refresh on" : "Auto-refresh"}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={15}
        emptyMessage="No activity found"
        mobileCard={(a) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {a.user_email}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${actionStyles[a.action] || "bg-slate-100 text-slate-600"}`}
              >
                {a.action.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{a.detail}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{a.ip_address || "—"}</span>
              <span>{formatTimestamp(a.created_at)}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
