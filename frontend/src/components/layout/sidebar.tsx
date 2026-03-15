"use client";

import { useAuth } from "@/lib/auth-context";
import { PlanBadge } from "@/components/ui/plan-badge";
import {
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: Key },
];

const adminItem = { href: "/dashboard/admin", label: "Admin", icon: Shield };

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const items = isAdmin ? [...navItems, adminItem] : navItems;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebar = (
    <div className="flex h-full w-[260px] flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="text-lg font-bold text-slate-900">
          SaaS Kit
        </Link>
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
              {user.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.full_name}
              </p>
              <PlanBadge plan={user.plan} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 animate-slide-in">
            {sidebar}
          </aside>
        </div>
      )}
    </>
  );
}
