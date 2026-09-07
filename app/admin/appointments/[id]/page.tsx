import { redirect, notFound } from "next/navigation";
import { getAuthSession, getAppointmentById } from "@/lib/actions";
import { AppointmentDetailClient } from "./AppointmentDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  return (
    <AppointmentDetailClient
      appointment={appointment}
      currentDoctor={session.doctor}
      clinic={session.clinic}
    />
  );
}
