"use client";

const planStyles: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export function PlanBadge({ plan }: { plan: string }) {
  const style = planStyles[plan] || planStyles.free;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {plan}
    </span>
  );
}
