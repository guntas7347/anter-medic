"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface PrescriptionItem {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
}

export async function createConsultation(data: {
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  complaint: string;
  diagnosis: string;
  notes?: string;
  bloodPressure?: string;
  temperature?: string;
  weight?: string;
  prescription?: PrescriptionItem[];
  followUpDate?: string;
}) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const {
    patientId,
    doctorId,
    appointmentId,
    complaint,
    diagnosis,
    notes,
    bloodPressure,
    temperature,
    weight,
    prescription,
    followUpDate,
  } = data;

  if (!patientId || !complaint?.trim() || !diagnosis?.trim()) {
    return { error: "Complaint and Diagnosis are required." };
  }

  const followUp = followUpDate ? new Date(followUpDate) : null;
  const prescriptionJson =
    prescription && prescription.length > 0
      ? JSON.stringify(prescription)
      : null;

  // Create consultation
  const consultation = await prisma.consultation.create({
    data: {
      clinicId,
      patientId,
      doctorId: doctorId || auth.doctor.id,
      appointmentId: appointmentId || null,
      complaint: complaint.trim(),
      diagnosis: diagnosis.trim(),
      notes: notes?.trim() || null,
      bloodPressure: bloodPressure?.trim() || null,
      temperature: temperature?.trim() || null,
      weight: weight?.trim() || null,
      prescription: prescriptionJson,
      followUpDate: followUp,
    },
  });

  // If linked to an appointment, mark as CONSULTED
  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CONSULTED",
      },
    });
  }

  revalidatePath("/admin/appointments");
  if (appointmentId) revalidatePath(`/admin/appointments/${appointmentId}`);
  revalidatePath(`/admin/patients/${patientId}`);
  revalidatePath("/admin/patients");

  return { success: true, consultationId: consultation.id };
}

export async function getConsultationById(id: string) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const consultation = await prisma.consultation.findFirst({
    where: {
      id,
      clinicId,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return consultation;
}

export async function deleteConsultation(consultationId: string) {
  const auth = await requireAuth();
  const clinicId = auth.doctor.clinicId;

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      clinicId,
    },
  });

  if (!consultation) {
    return { error: "Consultation not found or unauthorized." };
  }

  // If linked to an appointment, we can reset the appointment status if needed or keep it
  if (consultation.appointmentId) {
    await prisma.appointment.updateMany({
      where: {
        id: consultation.appointmentId,
        clinicId,
      },
      data: {
        status: "SCHEDULED",
      },
    });
  }

  await prisma.consultation.delete({
    where: {
      id: consultationId,
    },
  });

  revalidatePath(`/admin/patients/${consultation.patientId}`);
  revalidatePath(`/admin/patients`);
  revalidatePath(`/admin/appointments`);

  return { success: true, message: "Consultation deleted successfully." };
}

