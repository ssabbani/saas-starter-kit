"use client";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Activity, UsageRecord } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { PlanBadge } from "@/components/ui/plan-badge";
import { CardSkeleton, ActivitySkeleton } from "@/components/ui/loading-skeleton";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  HardDrive,
  Key,
  Sparkles,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageRecord[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const fetchData = useCallback(async () => {
    const [u, a] = await Promise.allSettled([
      api.get<UsageRecord[]>("/api/users/me/usage"),
      api.get<Activity[]>("/api/users/me/activity"),
    ]);
    if (u.status === "fulfilled") setUsage(u.value);
    if (a.status === "fulfilled") setActivities(a.value);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;

  // Trial calculation
  const trialEndsAt = user.trial_ends_at
    ? new Date(user.trial_ends_at)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : null;
  const showTrialBanner =
    !bannerDismissed &&
    trialDaysLeft !== null &&
    trialDaysLeft <= 7 &&
    trialDaysLeft > 0;

  // Usage data
  const apiCalls = usage?.find((u) => u.metric_name === "api_calls");
  const storage = usage?.find((u) => u.metric_name === "storage_mb");

  return (
    <div className="animate-fade-in space-y-8">
      {/* Trial Banner */}
      {showTrialBanner && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Your trial expires in {trialDaysLeft} day
              {trialDaysLeft !== 1 ? "s" : ""}. Upgrade to keep your features.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              Upgrade
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.full_name}
        </h1>
        <div className="mt-1 flex items-center gap-3">
          <PlanBadge plan={user.plan} />
          {trialDaysLeft !== null && trialDaysLeft > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in
                trial
              </span>
              <div className="h-1.5 w-24 rounded-full bg-slate-200">
                <div
                  className="h-1.5 rounded-full bg-indigo-500 transition-all"
                  style={{
                    width: `${Math.max(5, ((14 - trialDaysLeft) / 14) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      {usage === null ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            label="API Calls"
            value={`${apiCalls?.count ?? 0} / ${apiCalls?.limit_value ?? 0}`}
            subtitle="This billing period"
            progress={apiCalls?.percentage ?? 0}
          />
          <StatCard
            icon={<HardDrive className="h-5 w-5" />}
            label="Storage"
            value={`${storage?.count ?? 0} / ${storage?.limit_value ?? 0} MB`}
            subtitle="Total usage"
            progress={storage?.percentage ?? 0}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Current Plan"
            value={user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            subtitle="Active subscription"
            action={
              user.plan === "free" || user.plan === "starter" ? (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Upgrade
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            icon={<BookOpen className="h-5 w-5" />}
            label="View API Docs"
            description="Explore the API reference"
            href="/api-docs"
          />
          <QuickAction
            icon={<Key className="h-5 w-5" />}
            label="Generate API Key"
            description="Create a new key"
            href="/dashboard/api-keys"
          />
          <QuickAction
            icon={<UserPlus className="h-5 w-5" />}
            label="Invite Team Member"
            description="Coming soon"
            disabled
          />
          <QuickAction
            icon={<Sparkles className="h-5 w-5" />}
            label="Upgrade Plan"
            description="Get more features"
            href="/pricing"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
        {activities === null ? (
          <ActivitySkeleton />
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No recent activity
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.slice(0, 10).map((a) => (
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

function QuickAction({
  icon,
  label,
  description,
  href,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href?: string;
  disabled?: boolean;
}) {
  const classes =
    "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300";

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className={`${classes} cursor-not-allowed opacity-50`}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href!} className={classes}>
      {content}
    </Link>
  );
}
