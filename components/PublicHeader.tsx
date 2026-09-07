"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Stethoscope } from "lucide-react";
import { clinicConfig } from "@/lib/config";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-teal-700 transition-colors">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg block leading-tight">
              {clinicConfig.name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Care & Wellness
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
