"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg
          className="h-8 w-8 animate-spin text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md w-full mx-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {user.full_name}!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You&apos;re signed in as {user.email} ({user.plan} plan)
        </p>
        <p className="mt-4 text-xs text-slate-400">
          Dashboard UI will be built in the next prompt.
        </p>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
