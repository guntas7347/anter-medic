import { getAuthSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { AdminLoginClient } from "./AdminLoginClient";

export default async function AdminLoginPage() {
  const session = await getAuthSession();
  if (session && session.doctor) {
    redirect("/admin/appointments");
  }

  return <AdminLoginClient />;
}
