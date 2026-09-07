"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/lib/actions";
import { Calendar, Users, Settings, LogOut, Stethoscope } from "lucide-react";
import { useTransition } from "react";

interface AdminNavProps {
  doctorName?: string;
  clinicName?: string;
}

export function AdminNav({ doctorName, clinicName }: AdminNavProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const isAppointments =
    pathname.startsWith("/admin/appointments") ||
    pathname.startsWith("/admin/consult") ||
    pathname === "/admin";
  const isPatients =
    pathname.startsWith("/admin/patients") ||
    pathname.startsWith("/admin/consultations");
  const isSettings = pathname.startsWith("/admin/settings");

  const navItems = [
    {
      href: "/admin/appointments",
      label: "Appointments",
      icon: Calendar,
      isActive: isAppointments,
    },
    {
      href: "/admin/patients",
      label: "Patients",
      icon: Users,
      isActive: isPatients,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      isActive: isSettings,
    },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white text-sm block leading-none truncate">
                {clinicName || "Clinic Admin"}
              </span>
              {doctorName && (
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate block mt-0.5">
                  {doctorName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Admin Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.35)]"
      >
        <div className="max-w-xl mx-auto px-3 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex items-center justify-center transition-all duration-200 rounded-2xl ${
                  /* Small screen: compact icon-only button; Large screen: wide button with icon + label */
                  item.isActive
                    ? "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 font-semibold shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                } px-4 py-2.5 sm:px-5 sm:py-2.5 gap-2`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
                    item.isActive ? "scale-110 sm:scale-100" : ""
                  }`}
                />
                {/* On small screens, hide text label and show only icon */}
                <span className="hidden sm:inline text-xs sm:text-sm font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
