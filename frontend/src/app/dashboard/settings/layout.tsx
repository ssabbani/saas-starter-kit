"use client";

import {
  Bell,
  CreditCard,
  Key,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/settings", label: "Profile", icon: User },
  { href: "/dashboard/settings/security", label: "Security", icon: Shield },
  {
    href: "/dashboard/settings/notifications",
    label: "Notifications",
    icon: Bell,
  },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings/danger", label: "Danger Zone", icon: Trash2 },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your account settings and preferences
      </p>

      {/* Tabs */}
      <nav className="mt-6 border-b border-slate-200">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active =
              tab.href === "/dashboard/settings"
                ? pathname === "/dashboard/settings"
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
