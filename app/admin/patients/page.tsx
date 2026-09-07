import { redirect } from "next/navigation";
import { getAuthSession, getPatients } from "@/lib/actions";
import { PatientsClient } from "./PatientsClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PatientsPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const { q } = await searchParams;
  const patients = await getPatients(q);

  return (
    <PatientsClient
      initialPatients={patients as any}
      currentDoctor={session.doctor}
      clinic={session.clinic}
      initialQuery={q || ""}
    />
  );
}
