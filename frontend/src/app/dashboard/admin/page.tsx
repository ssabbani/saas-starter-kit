"use client";

import { api } from "@/lib/api";
import type { AdminActivity, AdminStats, AdminUser } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false },
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false },
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false },
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false },
);
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const PieChart = dynamic(
  () => import("recharts").then((m) => m.PieChart),
  { ssr: false },
);
const Pie = dynamic(
  () => import("recharts").then((m) => m.Pie),
  { ssr: false },
);
const Cell = dynamic(
  () => import("recharts").then((m) => m.Cell),
  { ssr: false },
);
const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false },
);
const Bar = dynamic(
  () => import("recharts").then((m) => m.Bar),
  { ssr: false },
);

const PLAN_COLORS: Record<string, string> = {
  free: "#94a3b8",
  starter: "#3b82f6",
  pro: "#6366f1",
  enterprise: "#a855f7",
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 19,
  pro: 49,
  enterprise: 149,
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  const fetchData = useCallback(async () => {
    const [s, u, a] = await Promise.allSettled([
      api.get<AdminStats>("/api/admin/stats"),
      api.get<{ users: AdminUser[] }>("/api/admin/users?per_page=1000"),
      api.get<{ logs: AdminActivity[] }>("/api/admin/activity?per_page=10"),
    ]);
    if (s.status === "fulfilled") setStats(s.value);
    if (u.status === "fulfilled") setUsers(u.value.users || []);
    if (a.status === "fulfilled") setActivities(a.value.logs || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive chart data from users
  const signupData = deriveSignupChart(users);
  const planDistribution = derivePlanDistribution(users);
  const revenueByPlan = deriveRevenueByPlan(users);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      {stats === null ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Users"
            value={stats.total_users.toLocaleString()}
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Active Subscriptions"
            value={stats.active_subscriptions.toLocaleString()}
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Monthly Recurring Revenue"
            value={`$${stats.mrr.toLocaleString()}`}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="New Users This Month"
            value={stats.new_users_this_month.toLocaleString()}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Over Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Signups (Last 30 Days)
          </h3>
          {users === null ? (
            <div className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    name="Signups"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Plan Distribution
          </h3>
          {users === null ? (
            <div className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="mt-4 flex h-48 items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {planDistribution.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PLAN_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {planDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          PLAN_COLORS[entry.name] || "#94a3b8",
                      }}
                    />
                    <span className="text-xs capitalize text-slate-600">
                      {entry.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revenue by Plan */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Revenue by Plan
          </h3>
          {users === null ? (
            <div className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`$${value}`, "MRR"]}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {revenueByPlan.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PLAN_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Recent Activity (All Users)
        </h3>
        {!Array.isArray(activities) || activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No recent activity
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {Array.isArray(activities) && activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-3">
                <ActivityItem
                  action={a.action}
                  detail={`${a.user_email} — ${a.detail}`}
                  timestamp={a.created_at}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function deriveSignupChart(users: AdminUser[] | null) {
  if (!users) return [];
  const now = new Date();
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  for (const u of users) {
    const d = u.created_at.slice(0, 10);
    if (d in days) days[d]++;
  }
  return Object.entries(days).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }));
}

function derivePlanDistribution(users: AdminUser[] | null) {
  if (!users) return [];
  const counts: Record<string, number> = {};
  for (const u of users) {
    counts[u.plan] = (counts[u.plan] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function deriveRevenueByPlan(users: AdminUser[] | null) {
  if (!users) return [];
  const counts: Record<string, number> = {};
  for (const u of users) {
    counts[u.plan] = (counts[u.plan] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({
    name,
    revenue: count * (PLAN_PRICES[name] || 0),
  }));
}
