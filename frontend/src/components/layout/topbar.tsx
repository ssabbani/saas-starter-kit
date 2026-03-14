"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm md:hidden">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
