"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPatients(searchQuery?: string) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const query = searchQuery?.trim();
  const whereClause: any = { clinicId };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { mobile: { contains: query } },
    ];
  }

  const patients = await prisma.patient.findMany({
    where: whereClause,
    include: {
      consultations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      appointments: {
        where: { status: "SCHEDULED" },
        orderBy: { date: "asc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return patients;
}

export async function getPatientById(id: string) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      clinicId,
    },
    include: {
      appointments: {
        where: {
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
        include: { doctor: true },
        orderBy: { date: "asc" },
      },
      consultations: {
        include: { doctor: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return patient;
}

export async function createPatient(data: {
  name: string;
  age: number;
  gender: string;
  mobile: string;
}) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const { name, age, gender, mobile } = data;
  if (!name?.trim() || !age || !gender || !mobile?.trim()) {
    return { error: "All fields are required." };
  }

  const cleanMobile = mobile.replace(/\D/g, "");
  if (cleanMobile.length < 10) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  const existing = await prisma.patient.findUnique({
    where: {
      clinicId_mobile: {
        clinicId,
        mobile: cleanMobile,
      },
    },
  });

  if (existing) {
    return { success: true, patient: existing };
  }

  const patient = await prisma.patient.create({
    data: {
      clinicId,
      name: name.trim(),
      age: Number(age),
      gender,
      mobile: cleanMobile,
    },
  });

  revalidatePath("/admin/patients");
  return { success: true, patient };
}
