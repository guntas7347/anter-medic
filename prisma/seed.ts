import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";
import bcrypt from "bcryptjs";
import { clinicConfig, INITIAL_DOCTORS } from "../lib/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with updated config...");

  // 1. Create or upsert Clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: "clinic-main-001" },
    update: {
      name: clinicConfig.name,
      address: clinicConfig.address,
      phone: clinicConfig.phone,
    },
    create: {
      id: "clinic-main-001",
      name: clinicConfig.name,
      address: clinicConfig.address,
      phone: clinicConfig.phone,
    },
  });
  console.log("Clinic ready:", clinic.name);

  // 2. Passwords
  const defaultPasswordHash = await bcrypt.hash("doctor123", 10);

  // 3. Create Users
  for (const doc of INITIAL_DOCTORS) {
    const user = await prisma.user.upsert({
      where: { username: doc.username },
      update: { password: defaultPasswordHash },
      create: {
        username: doc.username,
        password: defaultPasswordHash,
      },
    });
    console.log(`User ready: ${user.username} (password: doctor123)`);

    const doctor = await prisma.doctor.upsert({
      where: { username: doc.username },
      update: {
        name: doc.name,
        qualification: doc.qualification,
        specialization: doc.specialization,
        phone: doc.phone,
        clinicId: clinic.id,
      },
      create: {
        name: doc.name,
        qualification: doc.qualification,
        specialization: doc.specialization,
        phone: doc.phone,
        username: doc.username,
        clinicId: clinic.id,
      },
    });
    console.log(`Doctor ready: ${doctor.name} (${doctor.username})`);
  }

  // 4. Sample Patients
  const patient1 = await prisma.patient.upsert({
    where: {
      clinicId_mobile: {
        clinicId: clinic.id,
        mobile: "9876500001",
      },
    },
    update: {
      name: "Rahul Sharma",
      age: 32,
      gender: "Male",
    },
    create: {
      clinicId: clinic.id,
      name: "Rahul Sharma",
      age: 32,
      gender: "Male",
      mobile: "9876500001",
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: {
      clinicId_mobile: {
        clinicId: clinic.id,
        mobile: "9876500002",
      },
    },
    update: {
      name: "Simran Kaur",
      age: 28,
      gender: "Female",
    },
    create: {
      clinicId: clinic.id,
      name: "Simran Kaur",
      age: 28,
      gender: "Female",
      mobile: "9876500002",
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: {
      clinicId_mobile: {
        clinicId: clinic.id,
        mobile: "9876500003",
      },
    },
    update: {
      name: "Gurpreet Singh",
      age: 45,
      gender: "Male",
    },
    create: {
      clinicId: clinic.id,
      name: "Gurpreet Singh",
      age: 45,
      gender: "Male",
      mobile: "9876500003",
    },
  });

  // 5. Sample Appointments for Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doc1 = await prisma.doctor.findUnique({ where: { username: "anter" } });
  const doc2 = await prisma.doctor.findUnique({ where: { username: "sukhjinder" } });

  if (doc1) {
    const existingAppt1 = await prisma.appointment.findFirst({
      where: { patientId: patient1.id, date: today },
    });
    if (!existingAppt1) {
      await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          doctorId: doc1.id,
          patientId: patient1.id,
          date: today,
          startTime: "10:00 AM",
          endTime: "10:20 AM",
          problem: "Fever and mild cough for 3 days",
          status: "SCHEDULED",
        },
      });
    }

    const existingPastConsult = await prisma.consultation.findFirst({
      where: { patientId: patient1.id },
    });
    if (!existingPastConsult) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 4);
      await prisma.consultation.create({
        data: {
          clinicId: clinic.id,
          patientId: patient1.id,
          doctorId: doc1.id,
          complaint: "Headache and fatigue",
          diagnosis: "Tension headache with mild dehydration",
          notes: "Advised 3 liters water intake daily and adequate rest.",
          bloodPressure: "120/80 mmHg",
          temperature: "98.6 °F",
          weight: "72 kg",
          prescription: JSON.stringify([
            {
              medicine: "Tab. Paracetamol 650mg",
              dose: "1 tab",
              frequency: "SOS",
              duration: "3 days",
            },
            {
              medicine: "Tab. Multivitamin",
              dose: "1 tab",
              frequency: "OD",
              duration: "10 days",
            },
          ]),
          createdAt: pastDate,
        },
      });
    }
  }

  if (doc2) {
    const existingAppt2 = await prisma.appointment.findFirst({
      where: { patientId: patient2.id, date: today },
    });
    if (!existingAppt2) {
      await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          doctorId: doc2.id,
          patientId: patient2.id,
          date: today,
          startTime: "11:00 AM",
          endTime: "11:20 AM",
          problem: "Routine paediatric checkup",
          status: "SCHEDULED",
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
