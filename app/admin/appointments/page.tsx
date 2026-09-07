import { redirect } from "next/navigation";
import { getAuthSession, getAppointments, getPublicClinicData } from "@/lib/actions";
import { AppointmentsClient } from "./AppointmentsClient";

interface PageProps {
  searchParams: Promise<{
    date?: string;
    doctor?: string;
  }>;
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const params = await searchParams;
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = params.date || todayStr;
  const selectedDoctorId = params.doctor || "ALL";

  const [appointments, clinicData] = await Promise.all([
    getAppointments(selectedDate, selectedDoctorId),
    getPublicClinicData(),
  ]);

  return (
    <AppointmentsClient
      initialAppointments={appointments as any}
      doctors={clinicData.doctors}
      currentDoctor={session.doctor}
      clinic={session.clinic}
      selectedDate={selectedDate}
      selectedDoctorId={selectedDoctorId}
    />
  );
}
