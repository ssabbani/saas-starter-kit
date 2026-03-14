"use client";

import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  progress?: number; // 0-100
  action?: ReactNode;
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 20;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const color =
    progress >= 90
      ? "text-red-500"
      : progress >= 70
        ? "text-amber-500"
        : "text-indigo-500";

  return (
    <svg width={radius * 2} height={radius * 2} className="shrink-0">
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-slate-100"
      />
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`${color} transition-all duration-500`}
        transform={`rotate(-90 ${radius} ${radius})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-slate-700 text-[9px] font-semibold"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  progress,
  action,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {progress !== undefined && <ProgressRing progress={progress} />}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
