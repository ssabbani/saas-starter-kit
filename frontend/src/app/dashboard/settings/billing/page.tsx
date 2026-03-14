"use client";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useToast } from "@/components/ui/toast";
import type { Subscription } from "@/lib/types";
import { CreditCard, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const planPrices: Record<string, string> = {
  free: "$0/mo",
  starter: "$19/mo",
  pro: "$49/mo",
  enterprise: "$99/mo",
};

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await api.get<Subscription>("/api/billing/subscription");
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const data = await api.post<{ url: string }>("/api/billing/portal");
      window.location.href = data.url;
    } catch {
      toast("error", "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Current Plan */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Current Plan
        </h2>

        {loading ? (
          <div className="mt-4 h-24 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-slate-900 capitalize">
                      {user.plan} Plan
                    </p>
                    <PlanBadge plan={user.plan} />
                  </div>
                  <p className="text-sm text-slate-500">
                    {planPrices[user.plan] || "$0/mo"}
                  </p>
                </div>
              </div>
              {subscription && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    subscription.status === "active"
                      ? "bg-green-50 text-green-700"
                      : subscription.status === "trialing"
                        ? "bg-blue-50 text-blue-700"
                        : subscription.status === "past_due"
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {subscription.status.replace("_", " ")}
                </span>
              )}
            </div>

            {subscription?.current_period_end && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-500">
                  Current period ends{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(
                      subscription.current_period_end,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
                {subscription.cancel_at_period_end && (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    Subscription cancels at end of period
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          {subscription &&
          (subscription.status === "active" ||
            subscription.status === "trialing") ? (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <ExternalLink className="h-4 w-4" />
              {portalLoading ? "Opening..." : "Manage Billing"}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Choose a Plan
            </Link>
          )}
        </div>
      </section>

      {/* Invoices */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Invoices</h2>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <FileText className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-600">
              View invoices in Stripe portal
            </p>
            <p className="text-xs text-slate-400">
              Access your full invoice history and download receipts
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
