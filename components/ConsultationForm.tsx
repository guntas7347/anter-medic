"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { createConsultation, PrescriptionItem } from "@/lib/actions";
import {
  ArrowLeft,
  User,
  History,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Activity,
  Pill,
  Calendar,
} from "lucide-react";

interface ConsultationFormProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    mobile: string;
  };
  appointmentId?: string | null;
  initialComplaint?: string;
  currentDoctor: any;
  clinic: any;
  backHref?: string;
}

export function ConsultationForm({
  patient,
  appointmentId,
  initialComplaint = "",
  currentDoctor,
  clinic,
  backHref = "/admin/appointments",
}: ConsultationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicine: "", dose: "", frequency: "", duration: "" },
  ]);

  const { values, handleChange, setField } = useForm({
    complaint: initialComplaint,
    diagnosis: "",
    notes: "",
    bloodPressure: "",
    temperature: "",
    weight: "",
    followUpDate: "",
  });

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: "", dose: "", frequency: "", duration: "" },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (
    index: number,
    field: keyof PrescriptionItem,
    val: string
  ) => {
    const updated = [...prescriptions];
    updated[index][field] = val;
    setPrescriptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!values.complaint.trim()) {
      setErrorMsg("Please enter chief problem / complaint.");
      return;
    }
    if (!values.diagnosis.trim()) {
      setErrorMsg("Please enter diagnosis.");
      return;
    }

    // Filter out empty prescription rows
    const validPrescriptions = prescriptions.filter(
      (p) => p.medicine.trim().length > 0
    );

    startTransition(async () => {
      const res = await createConsultation({
        patientId: patient.id,
        doctorId: currentDoctor.id,
        appointmentId: appointmentId || null,
        complaint: values.complaint,
        diagnosis: values.diagnosis,
        notes: values.notes,
        bloodPressure: values.bloodPressure,
        temperature: values.temperature,
        weight: values.weight,
        prescription: validPrescriptions,
        followUpDate: values.followUpDate || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push(`/admin/patients/${patient.id}`);
        router.refresh();
      }
    });
  };

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Back Link & Title */}
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Dr. {currentDoctor?.name}
          </span>
        </div>

        {/* Patient Header Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white">
              {patient.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {patient.age} years • {patient.gender} • {patient.mobile}
            </p>
          </div>
          <Link
            href={`/admin/patients/${patient.id}`}
            target="_blank"
            className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History</span>
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Medical Notes / Findings */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Consultation
            </h2>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Problem / Chief Complaint *
              </label>
              <textarea
                name="complaint"
                value={values.complaint}
                onChange={handleChange}
                placeholder="e.g. Fever, dry cough, sore throat for 3 days"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Diagnosis *
              </label>
              <input
                type="text"
                name="diagnosis"
                value={values.diagnosis}
                onChange={handleChange}
                placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Notes / Instructions
              </label>
              <textarea
                name="notes"
                value={values.notes}
                onChange={handleChange}
                placeholder="e.g. Advised steam inhalation twice daily, rest, high fluid intake."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Optional Vitals */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Optional Vitals</span>
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={values.bloodPressure}
                  onChange={handleChange}
                  placeholder="120/80"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Temperature
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={values.temperature}
                  onChange={handleChange}
                  placeholder="98.6 °F"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={values.weight}
                  onChange={handleChange}
                  placeholder="70 kg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Prescription */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Prescription / Medicines</span>
              </h2>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="py-1 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {prescriptions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      Medicine #{idx + 1}
                    </span>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Tab. Paracetamol 650mg)"
                      value={item.medicine}
                      onChange={(e) =>
                        handlePrescriptionChange(idx, "medicine", e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Dose (1 tab)"
                      value={item.dose}
                      onChange={(e) =>
                        handlePrescriptionChange(idx, "dose", e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Freq (TDS / BD)"
                      value={item.frequency}
                      onChange={(e) =>
                        handlePrescriptionChange(idx, "frequency", e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={item.duration}
                      onChange={(e) =>
                        handlePrescriptionChange(idx, "duration", e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Follow-up Date (Optional)</span>
            </label>
            <input
              type="date"
              name="followUpDate"
              value={values.followUpDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 z-20 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving Consultation..." : "Save Consultation"}</span>
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
