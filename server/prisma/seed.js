const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 🦠 Diseases
  const fever = await prisma.disease.create({
    data: { name: "Fever" },
  });

  const heart = await prisma.disease.create({
    data: { name: "Heart Disease" },
  });

  const migraine = await prisma.disease.create({
    data: { name: "Migraine" },
  });

  // 👨‍⚕️ Doctors
  const doc1 = await prisma.doctor.create({
    data: {
      name: "Dr Sharma",
      email: "dr1@test.com",
      specialization: "General Physician",
    },
  });

  const doc2 = await prisma.doctor.create({
    data: {
      name: "Dr Verma",
      email: "dr2@test.com",
      specialization: "Cardiologist",
    },
  });

  const doc3 = await prisma.doctor.create({
    data: {
      name: "Dr Khan",
      email: "dr3@test.com",
      specialization: "Neurologist",
    },
  });

  // 🔗 Mapping
  await prisma.doctorDisease.createMany({
    data: [
      { doctor_id: doc1.doctor_id, disease_id: fever.disease_id },
      { doctor_id: doc2.doctor_id, disease_id: heart.disease_id },
      { doctor_id: doc3.doctor_id, disease_id: migraine.disease_id },
    ],
  });

  // 👤 Patients
  await prisma.patient.createMany({
    data: [
      { name: "Manish", phone: "9999999999" },
      { name: "Rahul", phone: "8888888888" },
    ],
  });

  console.log("🔥 Seed data inserted successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());