"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import { clinicConfig } from "@/lib/config";
import { revalidatePath } from "next/cache";

export async function getSettingsData() {
  const auth = await requireAuth();

  const [clinic, allDoctors, user] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: auth.clinic.id },
    }),
    prisma.doctor.findMany({
      where: { clinicId: auth.clinic.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, username: true, createdAt: true },
    }),
  ]);

  return {
    user: user || auth.user,
    currentDoctor: auth.doctor,
    clinic: clinic || auth.clinic,
    doctors: allDoctors,
    defaultConfig: clinicConfig,
  };
}

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const auth = await requireAuth();

  if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
    return { error: "All password fields are required." };
  }

  if (data.newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  if (data.newPassword !== data.confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
  });

  if (!user) {
    return { error: "User account not found." };
  }

  const isCurrentValid = await verifyPassword(data.currentPassword, user.password);
  if (!isCurrentValid) {
    return { error: "Incorrect current password." };
  }

  const hashedPassword = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true, message: "Password changed successfully." };
}

export async function updateDoctorDetailsAction(data: {
  doctorId: string;
  name: string;
  qualification: string;
  specialization: string;
  phone: string;
}) {
  const auth = await requireAuth();

  if (!data.doctorId || !data.name.trim()) {
    return { error: "Doctor name is required." };
  }

  // Ensure the doctor belongs to the same clinic
  const doctor = await prisma.doctor.findFirst({
    where: {
      id: data.doctorId,
      clinicId: auth.clinic.id,
    },
  });

  if (!doctor) {
    return { error: "Doctor not found in this clinic." };
  }

  await prisma.doctor.update({
    where: { id: data.doctorId },
    data: {
      name: data.name.trim(),
      qualification: data.qualification.trim(),
      specialization: data.specialization.trim(),
      phone: data.phone.trim(),
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/appointments");
  revalidatePath("/");

  return { success: true, message: "Doctor details updated successfully." };
}

export async function updateUserDetailsAction(data: { username: string }) {
  const auth = await requireAuth();
  const newUsername = data.username.trim().toLowerCase();

  if (!newUsername) {
    return { error: "Username cannot be empty." };
  }

  if (newUsername !== auth.user.username) {
    const existing = await prisma.user.findUnique({
      where: { username: newUsername },
    });
    if (existing && existing.id !== auth.user.id) {
      return { error: "Username is already taken by another user." };
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { username: newUsername },
    });

    // Also update associated doctor record if username was synced
    await prisma.doctor.updateMany({
      where: { username: auth.user.username, clinicId: auth.clinic.id },
      data: { username: newUsername },
    });
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings");

  return { success: true, message: "User details updated successfully." };
}

export async function updateClinicConfigAction(data: {
  clinicId: string;
  name: string;
  address: string;
  phone: string;
}) {
  const auth = await requireAuth();

  if (!data.name.trim() || !data.address.trim() || !data.phone.trim()) {
    return { error: "All clinic details are required." };
  }

  if (data.clinicId !== auth.clinic.id) {
    return { error: "Unauthorized clinic update." };
  }

  await prisma.clinic.update({
    where: { id: auth.clinic.id },
    data: {
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/appointments");
  revalidatePath("/");

  return { success: true, message: "Clinic configuration updated successfully." };
}
