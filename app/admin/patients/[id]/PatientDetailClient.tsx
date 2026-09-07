"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  FileText,
  Stethoscope,
  ChevronRight,
  Activity,
  Pill,
} from "lucide-react";

interface PatientDetailClientProps {
  patient: any;
  currentDoctor: any;
  clinic: any;
}

export function PatientDetailClient({
  patient,
  currentDoctor,
  clinic,
}: PatientDetailClientProps) {
  const upcomingAppointment = patient.appointments && patient.appointments[0];

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/patients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Patients</span>
          </Link>
        </div>

        {/* Patient Profile Header Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg shrink-0">
              {patient.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {patient.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <a
              href={`tel:${patient.mobile}`}
              className="font-mono font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              {patient.mobile}
            </a>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Link
              href={`/book`}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Book Appointment</span>
            </Link>

            <Link
              href={`/admin/consult/new?patientId=${patient.id}`}
              className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Consultation</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointment Card */}
        {upcomingAppointment && (
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Upcoming Appointment
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {upcomingAppointment.status}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {new Date(upcomingAppointment.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  • {upcomingAppointment.startTime}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {upcomingAppointment.doctor.name}
                </p>
              </div>

              <Link
                href={`/admin/appointments/${upcomingAppointment.id}`}
                className="py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Consultation History */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Consultation History ({patient.consultations?.length || 0})
          </h2>

          {(!patient.consultations || patient.consultations.length === 0) ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <FileText className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No past consultations recorded.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {patient.consultations.map((consult: any) => {
                const formattedDate = new Date(consult.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <div
                    key={consult.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {formattedDate}
                        </span>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {consult.doctor.name}
                        </p>
                      </div>

                      <Link
                        href={`/admin/consultations/${consult.id}`}
                        className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="text-xs flex flex-col gap-1.5">
                      <div>
                        <span className="text-slate-400 font-medium block text-[11px]">
                          Complaint
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {consult.complaint}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block text-[11px]">
                          Diagnosis
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-semibold text-teal-700 dark:text-teal-400">
                          {consult.diagnosis}
                        </p>
                      </div>

                      {consult.notes && (
                        <div>
                          <span className="text-slate-400 font-medium block text-[11px]">
                            Notes
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                            {consult.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
