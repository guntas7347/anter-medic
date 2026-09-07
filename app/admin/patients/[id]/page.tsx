import { redirect, notFound } from "next/navigation";
import { getAuthSession, getPatientById } from "@/lib/actions";
import { PatientDetailClient } from "./PatientDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  return (
    <PatientDetailClient
      patient={patient}
      currentDoctor={session.doctor}
      clinic={session.clinic}
    />
  );
}
