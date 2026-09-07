"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { createPatient, getPatients } from "@/lib/actions";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  startTime: string;
  endTime: string;
  problem: string;
  status: string;
  date: Date | string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    mobile: string;
  };
  doctor: {
    id: string;
    name: string;
  };
  consultation: {
    id: string;
  } | null;
}

interface DoctorItem {
  id: string;
  name: string;
}

interface AppointmentsClientProps {
  initialAppointments: AppointmentItem[];
  doctors: DoctorItem[];
  currentDoctor: any;
  clinic: any;
  selectedDate: string;
  selectedDoctorId: string;
}

export function AppointmentsClient({
  initialAppointments,
  doctors,
  currentDoctor,
  clinic,
  selectedDate,
  selectedDoctorId,
}: AppointmentsClientProps) {
  const router = useRouter();
  const [date, setDate] = useState(selectedDate);
  const [doctorId, setDoctorId] = useState(selectedDoctorId || "ALL");
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Walkin patient search & creation state
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const { values: newPatient, handleChange: handlePatientChange, resetForm: resetPatientForm } = useForm({
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    router.push(`/admin/appointments?date=${newDate}&doctor=${doctorId}`);
  };

  const handleDoctorChange = (newDoctorId: string) => {
    setDoctorId(newDoctorId);
    router.push(`/admin/appointments?date=${date}&doctor=${newDoctorId}`);
  };

  const handleSearchPatients = async (query: string) => {
    setPatientSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await getPatients(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateWalkinPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.mobile) return;

    startTransition(async () => {
      const res = await createPatient({
        name: newPatient.name,
        age: Number(newPatient.age),
        gender: newPatient.gender,
        mobile: newPatient.mobile,
      });

      if (res.success && res.patient) {
        setShowWalkinModal(false);
        router.push(`/admin/consult/new?patientId=${res.patient.id}`);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONSULTED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <CheckCircle2 className="w-3 h-3" />
            Consulted
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Appointments
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(date).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowWalkinModal(true);
              setShowNewPatientForm(false);
              setPatientSearch("");
              setSearchResults([]);
            }}
            className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Date Selector & Quick Filters */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDateChange(todayStr)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                date === todayStr
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Today
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Doctor Filter Tabs */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleDoctorChange("ALL")}
              className={`py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                doctorId === "ALL"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All Doctors
            </button>
            {doctors.map((doc) => (
              <button
                type="button"
                key={doc.id}
                onClick={() => handleDoctorChange(doc.id)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  doctorId === doc.id
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {doc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <section className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Schedule ({initialAppointments.length})
            </h2>
          </div>

          {initialAppointments.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No appointments for this date.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Booked appointments will appear here automatically.
              </p>
            </div>
          ) : (
            initialAppointments.map((appt) => (
              <Link
                key={appt.id}
                href={`/admin/appointments/${appt.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all flex items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Time Badge */}
                  <div className="w-14 shrink-0 text-center py-1.5 px-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight">
                      {appt.startTime.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                      {appt.startTime.split(" ")[1]}
                    </span>
                  </div>

                  {/* Patient & Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-teal-600 transition-colors">
                        {appt.patient.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {appt.patient.age}y • {appt.patient.gender[0]}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {appt.doctor.name}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-1 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md inline-block max-w-full">
                      {appt.problem}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(appt.status)}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </section>
      </main>

      {/* Walk-in Consultation Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Start Walk-in Consultation
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search existing patient or create a new one
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showNewPatientForm ? (
              <div className="flex flex-col gap-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => handleSearchPatients(e.target.value)}
                    placeholder="Search by name or mobile number..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Search Results */}
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {searching ? (
                    <p className="text-center py-3 text-xs text-slate-400">Searching...</p>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setShowWalkinModal(false);
                          router.push(`/admin/consult/new?patientId=${p.id}`);
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50/50 dark:bg-slate-800/40 text-left flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {p.age}y • {p.gender} • {p.mobile}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                          Select →
                        </span>
                      </button>
                    ))
                  ) : patientSearch.trim().length > 0 ? (
                    <div className="text-center py-3 text-xs text-slate-400">
                      No matching patient found.
                    </div>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Not in the system?</span>
                  <button
                    type="button"
                    onClick={() => setShowNewPatientForm(true)}
                    className="py-1.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Patient</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Create Patient Form */
              <form onSubmit={handleCreateWalkinPatient} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Patient Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewPatientForm(false)}
                    className="text-xs text-slate-400 hover:underline"
                  >
                    Back to search
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newPatient.name}
                    onChange={handlePatientChange}
                    placeholder="Full name"
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
                      value={newPatient.age}
                      onChange={handlePatientChange}
                      placeholder="Age"
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
                      value={newPatient.gender}
                      onChange={handlePatientChange}
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
                    Mobile (10 digits) *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={newPatient.mobile}
                    onChange={handlePatientChange}
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
                  <span>{isPending ? "Creating..." : "Create & Start Consultation"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
