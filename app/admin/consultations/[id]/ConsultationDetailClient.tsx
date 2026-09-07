"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteConsultation } from "@/lib/actions";
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Activity,
  Pill,
  FileText,
  Stethoscope,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { PrescriptionItem } from "@/lib/actions";

interface ConsultationDetailClientProps {
  consultation: any;
  currentDoctor: any;
  clinic: any;
}

export function ConsultationDetailClient({
  consultation,
  currentDoctor,
  clinic,
}: ConsultationDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  let prescriptions: PrescriptionItem[] = [];
  if (consultation.prescription) {
    try {
      prescriptions = JSON.parse(consultation.prescription);
    } catch {
      prescriptions = [];
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteConsultation(consultation.id);
      if (res.success) {
        router.push(`/admin/patients/${consultation.patientId}`);
      }
    });
  };

  const formattedDate = new Date(consultation.createdAt).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedFollowUp = consultation.followUpDate
    ? new Date(consultation.followUpDate).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Back Link & Delete Consultation Button */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/patients/${consultation.patientId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Patient Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Consultation</span>
          </button>
        </div>

        {/* Consultation Header */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Medical Consultation Record
              </span>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {consultation.patient.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {consultation.patient.age}y • {consultation.patient.gender} • {consultation.patient.mobile}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {formattedDate}
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                {consultation.doctor.name}
              </span>
            </div>
          </div>
        </div>

        {/* Complaints & Diagnosis */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Chief Problem / Complaint
            </span>
            <p className="text-slate-900 dark:text-white font-medium text-sm">
              {consultation.complaint}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Diagnosis
            </span>
            <p className="text-teal-700 dark:text-teal-300 font-bold text-sm">
              {consultation.diagnosis}
            </p>
          </div>

          {consultation.notes && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Clinical Notes / Advice
              </span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {consultation.notes}
              </p>
            </div>
          )}
        </div>

        {/* Vitals (if present) */}
        {(consultation.bloodPressure ||
          consultation.temperature ||
          consultation.weight) && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Vitals Recorded
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {consultation.bloodPressure && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Blood Pressure
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                    {consultation.bloodPressure}
                  </span>
                </div>
              )}
              {consultation.temperature && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Temperature
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                    {consultation.temperature}
                  </span>
                </div>
              )}
              {consultation.weight && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Weight
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                    {consultation.weight}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescription List */}
        {prescriptions.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Prescription ({prescriptions.length} Medicines)
            </span>

            <div className="flex flex-col gap-2">
              {prescriptions.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {med.medicine}
                  </span>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {med.dose && <span>Dose: {med.dose}</span>}
                    {med.frequency && <span>• Freq: {med.frequency}</span>}
                    {med.duration && <span>• Duration: {med.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Date */}
        {formattedFollowUp && (
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              Recommended Follow-up
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formattedFollowUp}
            </span>
          </div>
        )}
      </main>

      {/* Delete Consultation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Delete Consultation Record?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete this consultation for{" "}
              <strong className="text-slate-900 dark:text-white">
                {consultation.patient.name}
              </strong>
              ?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep Record
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
