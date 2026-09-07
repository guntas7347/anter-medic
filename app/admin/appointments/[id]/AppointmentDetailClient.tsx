"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus, deleteAppointment } from "@/lib/actions";
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
  Trash2,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDeleteAppointment = () => {
    startTransition(async () => {
      const res = await deleteAppointment(appointment.id);
      if (res.success) {
        router.push("/admin/appointments");
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
        {/* Back Link & Delete Action */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Appointments</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Appointment</span>
          </button>
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
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <a
                href={`tel:${appointment.patient.mobile}`}
                className="hover:underline font-mono"
              >
                {appointment.patient.mobile}
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <Link
                href={`/admin/patients/${appointment.patient.id}`}
                className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                Full Medical History →
              </Link>
            </div>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Appointment Information
          </h2>

          <div className="flex flex-col gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{appointment.startTime}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{appointment.doctor.name}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs mt-1">
              <span className="font-semibold text-slate-500 block mb-1">
                Reason / Reported Problem:
              </span>
              <p className="text-slate-900 dark:text-white font-medium">
                {appointment.problem}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {status !== "CANCELLED" && (
          <div className="flex flex-col gap-3">
            {status !== "CONSULTED" && (
              <>
                <Link
                  href={`/admin/consult/${appointment.id}`}
                  className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all text-center"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Start Consultation Now</span>
                </Link>

                <button
                  type="button"
                  onClick={handleMarkConsulted}
                  disabled={isPending}
                  className="w-full py-3 px-4 rounded-2xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
                  <p className="text-xs text-slate-500">This action will mark status as cancelled.</p>
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

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-sm w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Delete Appointment Record?
                  </h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to permanently delete this appointment for{" "}
                <strong className="text-slate-900 dark:text-white">
                  {appointment.patient.name}
                </strong>
                ?
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Keep Record
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAppointment}
                  disabled={isPending}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center"
                >
                  {isPending ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
