import { redirect } from "next/navigation";
import { getAuthSession, getSettingsData } from "@/lib/actions";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Admin Settings | Anter Medic",
  description: "Manage clinic settings, doctor profiles, account security, and credentials.",
};

export default async function SettingsPage() {
  const session = await getAuthSession();
  if (!session || !session.doctor) {
    redirect("/admin");
  }

  const settingsData = await getSettingsData();

  return (
    <SettingsClient
      user={settingsData.user}
      currentDoctor={settingsData.currentDoctor}
      clinic={settingsData.clinic}
      doctors={settingsData.doctors}
      defaultConfig={settingsData.defaultConfig}
    />
  );
}
