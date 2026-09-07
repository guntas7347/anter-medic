import { redirect, notFound } from "next/navigation";
import { getAuthSession, getPatientById } from "@/lib/actions";
import { ConsultationForm } from "@/components/ConsultationForm";

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewWalkinConsultPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { patientId } = await searchParams;
  if (!patientId) {
    redirect("/admin/appointments");
  }

  const patient = await getPatientById(patientId);
  if (!patient) {
    notFound();
  }

  return (
    <ConsultationForm
      patient={patient}
      appointmentId={null}
      currentDoctor={session.doctor}
      clinic={session.clinic}
      backHref="/admin/appointments"
    />
  );
}
