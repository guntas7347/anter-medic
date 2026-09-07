"use client";

import Link from "next/link";
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
  let prescriptions: PrescriptionItem[] = [];
  if (consultation.prescription) {
    try {
      prescriptions = JSON.parse(consultation.prescription);
    } catch {
      prescriptions = [];
    }
  }

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
        {/* Back Link */}
        <div>
          <Link
            href={`/admin/patients/${consultation.patientId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Patient Profile</span>
          </Link>
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
            <p className="text-teal-700 dark:text-teal-400 font-bold text-sm">
              {consultation.diagnosis}
            </p>
          </div>

          {consultation.notes && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Clinical Notes
              </span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {consultation.notes}
              </p>
            </div>
          )}
        </div>

        {/* Vitals (if recorded) */}
        {(consultation.bloodPressure || consultation.temperature || consultation.weight) && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Recorded Vitals
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              {consultation.bloodPressure && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BP</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {consultation.bloodPressure}
                  </span>
                </div>
              )}
              {consultation.temperature && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Temperature</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {consultation.temperature}
                  </span>
                </div>
              )}
              {consultation.weight && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Weight</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {consultation.weight}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescription */}
        {prescriptions.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Prescription
            </span>

            <div className="flex flex-col gap-2 pt-1">
              {prescriptions.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {idx + 1}. {med.medicine}
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
    </>
  );
}
