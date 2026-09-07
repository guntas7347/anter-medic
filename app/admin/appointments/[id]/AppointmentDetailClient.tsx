"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "@/lib/actions";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Stethoscope,
  XCircle,
  AlertTriangle,
  History,
} from "lucide-react";

interface AppointmentDetailClientProps {
  appointment: any;
  currentDoctor: any;
  clinic: any;
}

export function AppointmentDetailClient({
  appointment,
  currentDoctor,
  clinic,
}: AppointmentDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [status, setStatus] = useState(appointment.status);

  const handleMarkConsulted = () => {
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.id, "CONSULTED");
      if (res.success) {
        setStatus("CONSULTED");
        router.refresh();
      }
    });
  };

  const handleCancelAppointment = () => {
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.id, "CANCELLED");
      if (res.success) {
        setStatus("CANCELLED");
        setShowCancelConfirm(false);
        router.refresh();
      }
    });
  };

  const formattedDate = new Date(appointment.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Appointments</span>
          </Link>
        </div>

        {/* Patient Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {appointment.patient.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {appointment.patient.age} years • {appointment.patient.gender}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                status === "CONSULTED"
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                  : status === "CANCELLED"
                  ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Scheduled Slot</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{appointment.startTime}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{formattedDate}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Doctor</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {appointment.doctor.name}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block mb-0.5">Mobile Number</span>
            <a
              href={`tel:${appointment.patient.mobile}`}
              className="font-mono font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{appointment.patient.mobile}</span>
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Problem / Reason for Visit</span>
            <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-medium">
              {appointment.problem}
            </p>
          </div>

          {/* Quick link to patient history */}
          <div className="pt-1">
            <Link
              href={`/admin/patients/${appointment.patientId}`}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>View Full Patient History →</span>
            </Link>
          </div>
        </div>

        {/* Three Primary Actions */}
        {status !== "CANCELLED" && (
          <div className="flex flex-col gap-3">
            {status !== "CONSULTED" && (
              <>
                <Link
                  href={`/admin/consult/${appointment.id}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Consult (Enter Medical Record)</span>
                </Link>

                <button
                  type="button"
                  onClick={handleMarkConsulted}
                  disabled={isPending}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPending ? "Updating..." : "Mark as Consulted"}</span>
                </button>
              </>
            )}

            {status === "CONSULTED" && appointment.consultation && (
              <Link
                href={`/admin/consultations/${appointment.consultation.id}`}
                className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Consultation Record</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-xs transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-sm w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Cancel Appointment?
                  </h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  disabled={isPending}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  {isPending ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
