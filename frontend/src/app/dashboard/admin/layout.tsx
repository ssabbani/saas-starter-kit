"use client";

import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  BarChart3,
  CreditCard,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const tabs = [
  { href: "/dashboard/admin", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  {
    href: "/dashboard/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
  },
  { href: "/dashboard/admin/activity", label: "Activity", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin =
    user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldAlert className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Access Denied
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage users, subscriptions, and platform activity
      </p>

      <nav className="mt-6 border-b border-slate-200">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active =
              tab.href === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
