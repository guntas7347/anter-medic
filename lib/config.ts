export const clinicConfig = {
  name: "Anter Medic Clinic",
  tagline: "Quality medical care for you and your family.",
  address: "Vincare Hospital Bathinda",
  phone: "+91 98154 79938",
  email: "contact@antermedic.com",
  workingHours: {
    morning: { start: "09:00", end: "13:00" },
    evening: { start: "17:00", end: "20:30" },
    slotDurationMinutes: 20,
  },
};

export const ALLOWED_ADMIN_USERNAMES = ["anter", "sukhjinder"];

export const INITIAL_DOCTORS = [
  {
    name: "Dr. Anterpreet Kaur",
    shortName: "Dr. Anter",
    qualification: "MBBS, MD (Medicine)",
    specialization: "Internal Medicine & General Physician",
    phone: "+91 98154 79938",
    username: "anter",
  },
  {
    name: "Dr. Sukhjinder Singh",
    shortName: "Dr. Sukhjinder",
    qualification: "MBBS, MD (Paediatrics)",
    specialization: "Paediatrics & Child Health",
    phone: "+91 98788 02041",
    username: "sukhjinder",
  },
];
