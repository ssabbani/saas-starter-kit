"use client";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { plans } from "@/lib/pricing";
import type { CheckoutResponse } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function PricingContent() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Handle checkout=canceled query param
  useEffect(() => {
    if (searchParams.get("checkout") === "canceled") {
      toast("info", "Checkout was canceled. You can try again anytime.");
      router.replace("/pricing", { scroll: false });
    }
  }, [searchParams, toast, router]);

  const handleCheckout = useCallback(
    async (planKey: string, priceId: string) => {
      if (loading) return;

      if (!user) {
        router.push(`/signup?plan=${planKey}`);
        return;
      }

      setLoadingPlan(planKey);
      try {
        const data = await api.post<CheckoutResponse>("/api/billing/checkout", {
          price_id: priceId,
        });
        window.location.href = data.checkout_url;
      } catch {
        toast("error", "Failed to start checkout. Please try again.");
        setLoadingPlan(null);
      }
    },
    [user, loading, router, toast],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              annual ? "bg-indigo-600" : "bg-slate-200"
            }`}
            role="switch"
            aria-checked={annual}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                annual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-500"}`}
          >
            Annual
          </span>
          {annual && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Save 20%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annual_price : plan.monthly_price;
            const priceId = annual
              ? plan.annual_price_id
              : plan.monthly_price_id;
            const isCurrentPlan = user?.plan === plan.key;
            const isLoading = loadingPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md ${
                  plan.popular
                    ? "scale-[1.02] border-indigo-600 shadow-md ring-1 ring-indigo-600 lg:scale-105"
                    : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">
                    ${price}
                  </span>
                  <span className="text-sm text-slate-500">
                    /{annual ? "yr" : "mo"}
                  </span>
                  {annual && (
                    <p className="mt-1 text-xs text-slate-400">
                      ${plan.monthly_price}/mo billed monthly
                    </p>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-400"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key, priceId)}
                    disabled={isLoading}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {isLoading ? "Redirecting..." : "Start Free Trial"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to dashboard link for logged-in users */}
        {user && (
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        )}

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-2">
            <FaqItem
              question="Can I switch plans anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate applies at the next billing cycle."
            />
            <FaqItem
              question="What happens after my trial?"
              answer="After your 14-day free trial, you'll be automatically subscribed to the plan you selected. You can cancel before the trial ends to avoid being charged."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe."
            />
            <FaqItem
              question="Can I cancel anytime?"
              answer="Absolutely. You can cancel your subscription at any time from your billing settings. You'll continue to have access until the end of your current billing period."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
