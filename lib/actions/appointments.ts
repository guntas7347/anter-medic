"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAppointments(
  dateStr?: string,
  doctorIdFilter?: string,
) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const whereClause: any = {
    clinicId,
    date: {
      gte: targetDate,
      lt: nextDay,
    },
  };

  if (doctorIdFilter && doctorIdFilter !== "ALL") {
    whereClause.doctorId = doctorIdFilter;
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      patient: true,
      doctor: true,
      consultation: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return appointments;
}

export async function getAppointmentById(id: string) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      clinicId,
    },
    include: {
      patient: {
        include: {
          consultations: {
            orderBy: { createdAt: "desc" },
            include: { doctor: true },
          },
        },
      },
      doctor: true,
      consultation: true,
    },
  });

  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "SCHEDULED" | "CONFIRMED" | "CONSULTED" | "CANCELLED" | "NO_SHOW",
) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      clinicId,
    },
    data: {
      status,
    },
  });

  revalidatePath(`/admin/appointments`);
  revalidatePath(`/admin/appointments/${appointmentId}`);
  revalidatePath(`/admin/patients`);

  return { success: true };
}
