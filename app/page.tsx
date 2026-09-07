import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { getPublicClinicData } from "@/lib/actions";
import { MapPin, Phone, Clock, ArrowRight, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { clinic, doctors } = await getPublicClinicData();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Clinic Hero / Header */}
        <section className="text-center py-2 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
            Open for Consultations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {clinic.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
            Quality medical care for you and your family.
          </p>
        </section>

        {/* Primary CTA Button */}
        <div className="w-full">
          <Link
            href="/book"
            className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-center"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Doctors Section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Our Doctors
          </h2>

          <div className="flex flex-col gap-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {doctor.name}
                  </h3>
                  <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-0.5">
                    {doctor.qualification}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {doctor.specialization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Clinic Details */}
        <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Clinic Information
          </h2>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>{clinic.address}</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <a
              href={`tel:${clinic.phone}`}
              className="hover:underline font-medium"
            >
              {clinic.phone}
            </a>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p>Morning: 09:00 AM – 01:00 PM</p>
              <p>Evening: 05:00 PM – 08:30 PM</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800">
        © {new Date().getFullYear()} {clinic.name}. All rights reserved.
      </footer>
    </div>
  );
}
