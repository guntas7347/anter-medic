import { PublicHeader } from "@/components/PublicHeader";
import { getPublicClinicData } from "@/lib/actions";
import { BookingClient } from "./BookingClient";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { doctors } = await getPublicClinicData();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />
      <main className="flex-1">
        <BookingClient doctors={doctors} />
      </main>
    </div>
  );
}
