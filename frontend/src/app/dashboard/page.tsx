"use client";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Activity, UsageRecord } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { PlanBadge } from "@/components/ui/plan-badge";
import { CardSkeleton, ActivitySkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Copy,
  HardDrive,
  Key,
  Sparkles,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<UsageRecord[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  // Handle checkout redirect params
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast("success", "Subscription activated! Welcome aboard.");
      router.replace("/dashboard", { scroll: false });
    } else if (checkout === "canceled") {
      toast("info", "Checkout was canceled. You can try again anytime.");
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, toast, router]);

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

  const handleGenerateKey = useCallback(async () => {
    setGeneratingKey(true);
    try {
      const data = await api.post<{ api_key: string }>("/api/users/me/generate-api-key");
      setGeneratedKey(data.api_key);
    } catch {
      toast("error", "Failed to generate API key");
    } finally {
      setGeneratingKey(false);
    }
  }, [toast]);

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
            externalHref={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`}
          />
          <QuickAction
            icon={<Key className="h-5 w-5" />}
            label="Generate API Key"
            description="Create a new key"
            onClick={handleGenerateKey}
            loading={generatingKey}
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

      {/* Generated API Key Modal */}
      {generatedKey && (
        <ApiKeyModal
          apiKey={generatedKey}
          onClose={() => setGeneratedKey(null)}
        />
      )}

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
  externalHref,
  onClick,
  disabled,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href?: string;
  externalHref?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const classes =
    "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300";

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {loading ? "Generating..." : label}
        </p>
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

  if (onClick) {
    return (
      <button onClick={onClick} disabled={loading} className={`${classes} text-left w-full`}>
        {content}
      </button>
    );
  }

  if (externalHref) {
    return (
      <a href={externalHref} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href!} className={classes}>
      {content}
    </Link>
  );
}

function ApiKeyModal({
  apiKey,
  onClose,
}: {
  apiKey: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    doneRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl modal-content">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Your New API Key</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-medium text-amber-800">
            Copy this now — you won&apos;t see it again
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-800">
            {apiKey}
          </code>
          <button
            onClick={handleCopy}
            aria-label="Copy API key"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <button
          ref={doneRef}
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
