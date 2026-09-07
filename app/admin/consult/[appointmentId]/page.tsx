import { redirect, notFound } from "next/navigation";
import { getAuthSession, getAppointmentById } from "@/lib/actions";
import { ConsultationForm } from "@/components/ConsultationForm";

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function ConsultAppointmentPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { appointmentId } = await params;
  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
    notFound();
  }

  return (
    <ConsultationForm
      patient={appointment.patient}
      appointmentId={appointment.id}
      initialComplaint={appointment.problem}
      currentDoctor={session.doctor}
      clinic={session.clinic}
      backHref={`/admin/appointments/${appointment.id}`}
    />
  );
}
