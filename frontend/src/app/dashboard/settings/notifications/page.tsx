"use client";

import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

const settings: NotificationSetting[] = [
  {
    key: "product_updates",
    label: "Product Updates",
    description: "Get notified about new features and improvements",
  },
  {
    key: "billing_alerts",
    label: "Billing Alerts",
    description: "Receive alerts about payment issues and invoices",
  },
  {
    key: "security_alerts",
    label: "Security Alerts",
    description: "Important notifications about your account security",
  },
  {
    key: "weekly_report",
    label: "Weekly Usage Report",
    description: "Receive a weekly summary of your API usage",
  },
];

export default function NotificationsPage() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    product_updates: true,
    billing_alerts: true,
    security_alerts: true,
    weekly_report: false,
  });

  const handleToggle = async (key: string) => {
    const newValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newValue }));

    try {
      await api.patch("/api/users/me", {
        notification_preferences: { ...prefs, [key]: newValue },
      });
      toast("success", "Notification preference updated");
    } catch {
      setPrefs((prev) => ({ ...prev, [key]: !newValue }));
      toast("error", "Failed to update preference");
    }
  };

  return (
    <div className="max-w-2xl">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Email Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose what emails you want to receive
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {setting.label}
                </p>
                <p className="text-xs text-slate-500">
                  {setting.description}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={prefs[setting.key]}
                onClick={() => handleToggle(setting.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  prefs[setting.key] ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                    prefs[setting.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
