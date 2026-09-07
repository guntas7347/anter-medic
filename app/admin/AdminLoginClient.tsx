"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { loginAction } from "@/lib/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Stethoscope, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { clinicConfig } from "@/lib/config";

export function AdminLoginClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { values, handleChange } = useForm({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!values.username.trim() || !values.password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    startTransition(async () => {
      const res = await loginAction({
        username: values.username,
        password: values.password,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        window.location.href = "/admin/appointments";
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            {clinicConfig.name}
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Clinic Doctor Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your doctor credentials to manage clinic
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  placeholder="e.g. anter or sukhjinder"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isPending ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <a
              href="/"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              ← Return to public site
            </a>
          </div>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        Doctor access only • Secure session
      </div>
    </div>
  );
}
