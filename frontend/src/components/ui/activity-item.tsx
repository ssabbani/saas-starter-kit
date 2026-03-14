"use client";

import { Key, Lock, LogIn, UserPlus, CreditCard, Settings, Activity as ActivityIcon } from "lucide-react";
import type { ReactNode } from "react";

const actionIcons: Record<string, ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  signup: <UserPlus className="h-4 w-4" />,
  password_change: <Lock className="h-4 w-4" />,
  password_reset: <Lock className="h-4 w-4" />,
  api_key_created: <Key className="h-4 w-4" />,
  api_key_revoked: <Key className="h-4 w-4" />,
  subscription_created: <CreditCard className="h-4 w-4" />,
  subscription_updated: <CreditCard className="h-4 w-4" />,
  settings_updated: <Settings className="h-4 w-4" />,
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ActivityItemProps {
  action: string;
  detail: string;
  timestamp: string;
}

export function ActivityItem({ action, detail, timestamp }: ActivityItemProps) {
  const icon = actionIcons[action] || <ActivityIcon className="h-4 w-4" />;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">{detail}</p>
        <p className="text-xs text-slate-400">{timeAgo(timestamp)}</p>
      </div>
    </div>
  );
}
