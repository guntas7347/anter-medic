"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useForm } from "@/hooks/useForm";
import { getAvailableTimeSlots, bookPublicAppointment } from "@/lib/actions";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Home,
  PhoneCall,
  Info,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
}

interface BookingClientProps {
  doctors: Doctor[];
}

export function BookingClient({ doctors }: BookingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; isAvailable: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [showSlotPicker, setShowSlotPicker] = useState(false); // Collapsed by default

  // Default to today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  const { values, handleChange, setField } = useForm({
    doctorId: doctors[0]?.id || "",
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
    problem: "",
    isExistingPatient: "No",
    date: todayStr,
    startTime: "",
  });

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (!values.doctorId || !values.date) return;
    setLoadingSlots(true);

    getAvailableTimeSlots(values.doctorId, values.date)
      .then((res) => {
        setSlots(res);
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [values.doctorId, values.date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!values.doctorId) {
      setErrorMsg("Please select a doctor.");
      return;
    }
    if (!values.name.trim()) {
      setErrorMsg("Please enter patient name.");
      return;
    }
    if (!values.age || Number(values.age) <= 0) {
      setErrorMsg("Please enter a valid age.");
      return;
    }
    const cleanPhone = values.mobile.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!values.problem.trim()) {
      setErrorMsg("Please enter the reason for your visit.");
      return;
    }

    startTransition(async () => {
      const res = await bookPublicAppointment({
        doctorId: values.doctorId,
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        mobile: cleanPhone,
        problem: values.problem,
        isExistingPatient: values.isExistingPatient === "Yes",
        date: values.date,
        startTime: values.startTime || "Flexible",
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success && res.appointment) {
        setConfirmedBooking(res.appointment);
      }
    });
  };

  // Confirmation view
  if (confirmedBooking) {
    return (
      <div className="max-w-md mx-auto py-8 px-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Appointment Requested
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your appointment request has been recorded.
        </p>

        {/* Details Card */}
        <div className="w-full mt-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left flex flex-col gap-3 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Appointment ID</span>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              #{confirmedBooking.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Doctor</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {confirmedBooking.doctorName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Date</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                {confirmedBooking.date}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Preferred Slot</span>
              <p className="font-semibold text-teal-600 dark:text-teal-400 text-sm mt-0.5">
                {confirmedBooking.time || "Flexible"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Patient</span>
              <p className="font-medium text-slate-900 dark:text-white text-sm mt-0.5">
                {confirmedBooking.patientName}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Mobile</span>
              <p className="font-medium text-slate-900 dark:text-white text-sm mt-0.5">
                {confirmedBooking.patientMobile}
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[12px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">Preferred Slot Notice:</span>
              The appointment time is a <strong>preferred slot</strong> and not a fixed schedule. You may receive a call from the clinic to confirm your exact consultation timing.
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Book an Appointment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fill in the details below to request a consultation
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 1. Doctor Selection */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Select Doctor *
          </label>
          <div className="flex flex-col gap-2.5">
            {doctors.map((doc) => {
              const isSelected = values.doctorId === doc.id;
              return (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setField("doctorId", doc.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 dark:border-teal-500 ring-2 ring-teal-600/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                      {doc.qualification}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {doc.specialization}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Date & Optional Slot Selection (Collapsed by Default) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Appointment Date & Slot
          </label>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
              Select Date *
            </label>
            <input
              type="date"
              name="date"
              min={todayStr}
              value={values.date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Collapsible Slot Picker */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowSlotPicker(!showSlotPicker)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Choose Preferred Slot (Optional)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-normal text-teal-600 dark:text-teal-400">
                  {values.startTime ? values.startTime : "Flexible / Any time"}
                </span>
                {showSlotPicker ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {showSlotPicker && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Available Time Slots
                  </span>
                  {values.startTime && (
                    <button
                      type="button"
                      onClick={() => setField("startTime", "")}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      Clear slot (Flexible)
                    </button>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="py-3 text-center text-xs text-slate-400">
                    Loading available slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-2 text-center text-xs text-slate-400">
                    No fixed slots available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => {
                      const isSelected = values.startTime === slot.time;
                      return (
                        <button
                          type="button"
                          key={slot.time}
                          disabled={!slot.isAvailable}
                          onClick={() => setField("startTime", slot.time)}
                          className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center ${
                            !slot.isAvailable
                              ? "bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-xs font-semibold"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500"
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Patient Information */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Patient Information *
          </label>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
              Patient Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={values.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
                Age (years) *
              </label>
              <input
                type="number"
                name="age"
                placeholder="e.g. 32"
                min="1"
                max="120"
                value={values.age}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
                Gender *
              </label>
              <select
                name="gender"
                value={values.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
              Mobile Number (10 digits) *
            </label>
            <input
              type="tel"
              name="mobile"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={values.mobile}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 block">
              Problem / Reason for Visit *
            </label>
            <textarea
              name="problem"
              rows={2}
              placeholder="e.g. Fever and cough for 3 days"
              value={values.problem}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1.5 block">
              Have you visited this clinic before? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Yes", "No"].map((option) => {
                const isSelected = values.isExistingPatient === option;
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setField("isExistingPatient", option)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-semibold text-base shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isPending ? "Booking Appointment..." : "Confirm & Book Appointment"}
        </button>
      </form>
    </div>
  );
}
