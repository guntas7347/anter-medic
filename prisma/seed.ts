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
  console.log("Setting up clinic and initial doctor accounts...");

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

  // 2. Default initial password
  const defaultPasswordHash = await bcrypt.hash("doctor123", 10);

  // 3. Create initial doctor accounts
  for (const doc of INITIAL_DOCTORS) {
    const user = await prisma.user.upsert({
      where: { username: doc.username },
      update: {},
      create: {
        username: doc.username,
        password: defaultPasswordHash,
      },
    });
    console.log(`User ready: ${user.username}`);

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

  console.log("Seed completed: Only essential clinic & doctor accounts are initialized.");
}

main()
  .catch((e) => {
    console.error("Error setting up database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
