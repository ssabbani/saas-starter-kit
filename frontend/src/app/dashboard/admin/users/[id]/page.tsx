"use client";

import { api } from "@/lib/api";
import type { AdminUser, AdminUserDetail, Subscription, UsageRecord, Activity } from "@/lib/types";
import { PlanBadge } from "@/components/ui/plan-badge";
import { ActivityItem } from "@/components/ui/activity-item";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const roleStyles: Record<string, string> = {
  user: "bg-slate-100 text-slate-700",
  admin: "bg-amber-100 text-amber-700",
  super_admin: "bg-red-100 text-red-700",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchUser = useCallback(async () => {
    try {
      const detail = await api.get<AdminUserDetail>(`/api/admin/users/${userId}`);
      setUser(detail.user);
      setSubscription(detail.subscription);
      setUsage(Array.isArray(detail.usage) ? detail.usage : []);
      setActivities(Array.isArray(detail.activity) ? detail.activity : []);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdate = async (patch: Record<string, unknown>) => {
    try {
      const updated = await api.patch<AdminUser>(
        `/api/admin/users/${userId}`,
        patch,
      );
      setUser((prev) => (prev ? { ...prev, ...updated } : updated));
      toast("success", "User updated");
    } catch {
      toast("error", "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">User not found</p>
        <Link
          href="/dashboard/admin/users"
          className="mt-2 inline-block text-sm font-medium text-indigo-600"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* User Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {user.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {user.full_name}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${roleStyles[user.role]}`}
                >
                  {user.role.replace("_", " ")}
                </span>
                <PlanBadge plan={user.plan} />
                <span
                  className={`inline-flex items-center gap-1 text-xs ${user.is_active ? "text-green-600" : "text-red-500"}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-400"}`}
                  />
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500 space-y-1">
            <p>
              Joined: <span className="font-medium text-slate-700">{formatDate(user.created_at)}</span>
            </p>
            <p>
              Last login: <span className="font-medium text-slate-700">{formatDate(user.last_login_at)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Actions</h3>
        <div className="mt-4 flex flex-wrap gap-4">
          {isSuperAdmin && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Role
              </label>
              <select
                value={user.role}
                onChange={(e) => handleUpdate({ role: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Plan
            </label>
            <select
              value={user.plan}
              onChange={(e) => handleUpdate({ plan: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <button
              onClick={() => handleUpdate({ is_active: !user.is_active })}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                user.is_active
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-green-200 text-green-600 hover:bg-green-50"
              }`}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Subscription</h3>
        {subscription ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  subscription.status === "active"
                    ? "bg-green-100 text-green-700"
                    : subscription.status === "trialing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Period End</p>
              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cancels at End</p>
              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {subscription.cancel_at_period_end ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No active subscription</p>
        )}
      </div>

      {/* Usage */}
      {usage.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Usage</h3>
          <div className="mt-4 space-y-4">
            {usage.map((u) => (
              <div key={u.metric_name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 capitalize">
                    {u.metric_name.replace("_", " ")}
                  </span>
                  <span className="font-medium text-slate-900">
                    {u.count} / {u.limit_value}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      u.percentage >= 90
                        ? "bg-red-500"
                        : u.percentage >= 70
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min(100, u.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Recent Activity
        </h3>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No activity recorded
          </p>
        ) : (
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {activities.map((a) => (
              <ActivityItem
                key={a.id}
                action={a.action}
                detail={a.detail}
                timestamp={a.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
