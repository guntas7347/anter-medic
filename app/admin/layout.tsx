import { getAuthSession } from "@/lib/actions";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // If unauthenticated (e.g., login page), render children directly without admin nav
  if (!session || !session.doctor) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <AdminNav
        doctorName={session.doctor.name}
        clinicName={session.clinic?.name}
      />
      <div className="flex-1 pb-20 sm:pb-24">
        {children}
      </div>
    </div>
  );
}
