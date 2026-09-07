import { redirect, notFound } from "next/navigation";
import { getAuthSession, getConsultationById } from "@/lib/actions";
import { ConsultationDetailClient } from "./ConsultationDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { id } = await params;
  const consultation = await getConsultationById(id);

  if (!consultation) {
    notFound();
  }

  return (
    <ConsultationDetailClient
      consultation={consultation}
      currentDoctor={session.doctor}
      clinic={session.clinic}
    />
  );
}
