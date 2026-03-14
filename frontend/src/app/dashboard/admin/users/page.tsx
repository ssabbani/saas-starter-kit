"use client";

import { api } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { PlanBadge } from "@/components/ui/plan-badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { useDebounce } from "@/lib/use-debounce";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const roleStyles: Record<string, string> = {
  user: "bg-slate-100 text-slate-700",
  admin: "bg-amber-100 text-amber-700",
  super_admin: "bg-red-100 text-red-700",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${roleStyles[role] || roleStyles.user}`}
    >
      {role.replace("_", " ")}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-red-400"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: AdminUser[] }>("/api/admin/users?per_page=1000");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      if (
        q &&
        !u.email.toLowerCase().includes(q) &&
        !u.full_name.toLowerCase().includes(q)
      )
        return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      if (statusFilter === "active" && !u.is_active) return false;
      if (statusFilter === "inactive" && u.is_active) return false;
      return true;
    });
  }, [users, search, roleFilter, planFilter, statusFilter]);

  const columns: Column<AdminUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (u) => (
          <div>
            <p className="font-medium text-slate-900">{u.full_name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        ),
        sortable: true,
        sortFn: (a, b) => a.full_name.localeCompare(b.full_name),
      },
      {
        key: "role",
        header: "Role",
        render: (u) => <RoleBadge role={u.role} />,
        sortable: true,
        sortFn: (a, b) => a.role.localeCompare(b.role),
      },
      {
        key: "plan",
        header: "Plan",
        render: (u) => <PlanBadge plan={u.plan} />,
        sortable: true,
        sortFn: (a, b) => a.plan.localeCompare(b.plan),
      },
      {
        key: "status",
        header: "Status",
        render: (u) => <StatusDot active={u.is_active} />,
      },
      {
        key: "joined",
        header: "Joined",
        render: (u) => (
          <span className="text-slate-500">{formatDate(u.created_at)}</span>
        ),
        hideOnMobile: true,
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      },
      {
        key: "last_login",
        header: "Last Login",
        render: (u) => (
          <span className="text-slate-500">
            {formatDate(u.last_login_at)}
          </span>
        ),
        hideOnMobile: true,
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.last_login_at || 0).getTime() -
          new Date(b.last_login_at || 0).getTime(),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            aria-label="Search users"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        onRowClick={(u) => router.push(`/dashboard/admin/users/${u.id}`)}
        emptyMessage="No users match your filters"
        mobileCard={(u) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                  {u.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {u.full_name}
                  </p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
              </div>
              <StatusDot active={u.is_active} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <RoleBadge role={u.role} />
              <PlanBadge plan={u.plan} />
              <span className="ml-auto text-xs text-slate-400">
                {formatDate(u.created_at)}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
