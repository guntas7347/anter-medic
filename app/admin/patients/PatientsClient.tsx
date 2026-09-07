"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { createPatient, getPatients } from "@/lib/actions";
import {
  Search,
  User,
  Plus,
  Phone,
  Calendar,
  ChevronRight,
  Clock,
  X,
  UserCheck,
} from "lucide-react";

interface PatientItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  consultations: {
    createdAt: Date | string;
  }[];
  appointments: {
    id: string;
    date: Date | string;
    startTime: string;
  }[];
}

interface PatientsClientProps {
  initialPatients: PatientItem[];
  currentDoctor: any;
  clinic: any;
  initialQuery?: string;
}

export function PatientsClient({
  initialPatients,
  currentDoctor,
  clinic,
  initialQuery = "",
}: PatientsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { values, handleChange, resetForm } = useForm({
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
  });

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setIsSearching(true);
    getPatients(val)
      .then((res) => {
        setPatients(res as any);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name || !values.age || !values.mobile) return;

    startTransition(async () => {
      const res = await createPatient({
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        mobile: values.mobile,
      });

      if (res.success && res.patient) {
        setShowNewModal(false);
        resetForm();
        router.push(`/admin/patients/${res.patient.id}`);
      }
    });
  };

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Top Header & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Patients
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {patients.length} registered {patients.length === 1 ? "patient" : "patients"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or mobile number..."
            className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Patients List */}
        <div className="flex flex-col gap-2.5">
          {isSearching ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Searching patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <User className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No patients found.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {query ? "Try searching with a different name or number." : "Add a patient to get started."}
              </p>
            </div>
          ) : (
            patients.map((p) => {
              const lastVisit = p.consultations[0]?.createdAt;
              const formattedLastVisit = lastVisit
                ? new Date(lastVisit).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "No visits yet";

              return (
                <Link
                  key={p.id}
                  href={`/admin/patients/${p.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {p.name[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-teal-600 transition-colors">
                          {p.name}
                        </h3>
                        <span className="text-xs text-slate-400 shrink-0">
                          {p.age}y • {p.gender[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono">{p.mobile}</span>
                        <span>•</span>
                        <span className="text-[11px] truncate">
                          Last visit: {formattedLastVisit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              );
            })
          )}
        </div>
      </main>

      {/* New Patient Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Add New Patient
                </h2>
                <p className="text-xs text-slate-500">
                  Register patient in clinic records
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    value={values.age}
                    onChange={handleChange}
                    placeholder="35"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={values.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isPending ? "Creating..." : "Save Patient"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
