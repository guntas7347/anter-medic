"use server";

import { prisma } from "@/lib/prisma";
import { clinicConfig } from "@/lib/config";
import { revalidatePath } from "next/cache";

export async function getPublicClinicData() {
  const clinic = await prisma.clinic.findFirst({
    include: {
      doctors: {
        select: {
          id: true,
          name: true,
          qualification: true,
          specialization: true,
          phone: true,
          username: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return {
    clinic: clinic || {
      name: clinicConfig.name,
      address: clinicConfig.address,
      phone: clinicConfig.phone,
    },
    doctors: clinic?.doctors || [],
  };
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const addRange = (
    startH: number,
    startM: number,
    endH: number,
    endM: number,
  ) => {
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (current < end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      slots.push(`${displayH}:${displayM} ${ampm}`);
      current += 20; // 20 min slots
    }
  };

  // Morning: 9:00 AM - 1:00 PM
  addRange(9, 0, 13, 0);
  // Evening: 5:00 PM - 8:30 PM
  addRange(17, 0, 20, 30);

  return slots;
}

export async function getAvailableTimeSlots(doctorId: string, dateStr: string) {
  if (!doctorId || !dateStr) return [];

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: targetDate,
        lt: nextDay,
      },
      status: {
        not: "CANCELLED",
      },
    },
    select: {
      startTime: true,
    },
  });

  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));
  const allSlots = generateTimeSlots();

  return allSlots.map((slot) => ({
    time: slot,
    isAvailable: !bookedTimes.has(slot),
  }));
}

export async function bookPublicAppointment(data: {
  doctorId: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  problem: string;
  isExistingPatient: boolean;
  date: string;
  startTime?: string;
}) {
  const { doctorId, name, age, gender, mobile, problem, date, startTime } =
    data;

  if (
    !doctorId ||
    !name?.trim() ||
    !age ||
    !gender ||
    !mobile?.trim() ||
    !problem?.trim() ||
    !date
  ) {
    return { error: "Please fill in all required fields." };
  }

  const cleanMobile = mobile.replace(/\D/g, "");
  if (cleanMobile.length < 10) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { clinic: true },
  });

  if (!doctor) {
    return { error: "Selected doctor was not found." };
  }

  const clinicId = doctor.clinicId;
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(appointmentDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const effectiveTime = startTime?.trim() ? startTime.trim() : "Flexible";

  // Check double-booking only if a specific slot is selected
  if (effectiveTime !== "Flexible") {
    const existingAppt = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: {
          gte: appointmentDate,
          lt: nextDay,
        },
        startTime: effectiveTime,
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (existingAppt) {
      return {
        error: "This time slot has just been booked. Please choose another slot.",
      };
    }
  }

  // Find or create patient
  let patient = await prisma.patient.findUnique({
    where: {
      clinicId_mobile: {
        clinicId,
        mobile: cleanMobile,
      },
    },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        clinicId,
        name: name.trim(),
        age: Number(age),
        gender,
        mobile: cleanMobile,
      },
    });
  } else {
    // Update existing patient info
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        name: name.trim(),
        age: Number(age),
        gender,
      },
    });
  }

  // Calculate appointment
  const appointment = await prisma.appointment.create({
    data: {
      clinicId,
      doctorId,
      patientId: patient.id,
      date: appointmentDate,
      startTime: effectiveTime,
      endTime: effectiveTime,
      problem: problem.trim(),
      status: "SCHEDULED",
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin/patients");

  return {
    success: true,
    appointment: {
      id: appointment.id,
      doctorName: appointment.doctor.name,
      patientName: appointment.patient.name,
      patientMobile: appointment.patient.mobile,
      date: appointmentDate.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: effectiveTime,
    },
  };
}
