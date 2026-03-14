"use client";

import { api } from "@/lib/api";
import type { AdminSubscription } from "@/lib/types";
import { PlanBadge } from "@/components/ui/plan-badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-600",
  unpaid: "bg-amber-100 text-amber-700",
  incomplete: "bg-slate-100 text-slate-500",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSubscriptions = useCallback(async () => {
    try {
      const data = await api.get<{ subscriptions: AdminSubscription[] }>(
        "/api/admin/subscriptions",
      );
      setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
    } catch {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return subscriptions;
    return subscriptions.filter((s) => s.status === statusFilter);
  }, [subscriptions, statusFilter]);

  const columns: Column<AdminSubscription>[] = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        render: (s) => (
          <div>
            <p className="font-medium text-slate-900">{s.user_name}</p>
            <p className="text-xs text-slate-400">{s.user_email}</p>
          </div>
        ),
        sortable: true,
        sortFn: (a, b) => a.user_name.localeCompare(b.user_name),
      },
      {
        key: "plan",
        header: "Plan",
        render: (s) => <PlanBadge plan={s.plan} />,
        sortable: true,
        sortFn: (a, b) => a.plan.localeCompare(b.plan),
      },
      {
        key: "status",
        header: "Status",
        render: (s) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[s.status] || statusStyles.incomplete}`}
          >
            {s.status.replace("_", " ")}
          </span>
        ),
        sortable: true,
        sortFn: (a, b) => a.status.localeCompare(b.status),
      },
      {
        key: "period_end",
        header: "Period End",
        render: (s) => (
          <span className="text-slate-500">
            {formatDate(s.current_period_end)}
          </span>
        ),
        hideOnMobile: true,
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.current_period_end || 0).getTime() -
          new Date(b.current_period_end || 0).getTime(),
      },
      {
        key: "cancel",
        header: "Cancels",
        render: (s) => (
          <span className={`text-xs font-medium ${s.cancel_at_period_end ? "text-amber-600" : "text-slate-400"}`}>
            {s.cancel_at_period_end ? "Yes" : "No"}
          </span>
        ),
        hideOnMobile: true,
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <span className="text-xs text-slate-400">
          {filtered.length} subscription{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        emptyMessage="No subscriptions found"
        mobileCard={(s) => (
          <div
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            onClick={() => router.push(`/dashboard/admin/users`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {s.user_name}
                </p>
                <p className="text-xs text-slate-400">{s.user_email}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[s.status]}`}
              >
                {s.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <PlanBadge plan={s.plan} />
              <span className="ml-auto text-xs text-slate-400">
                Ends {formatDate(s.current_period_end)}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
