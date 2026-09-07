"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  updateDoctorDetailsAction,
  updateUserDetailsAction,
  updateClinicConfigAction,
} from "@/lib/actions";
import {
  KeyRound,
  Stethoscope,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  GraduationCap,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

interface DoctorItem {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  phone: string;
  username: string;
}

interface SettingsClientProps {
  user: {
    id: string;
    username: string;
    createdAt?: Date | string;
  };
  currentDoctor: DoctorItem;
  clinic: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  doctors: DoctorItem[];
  defaultConfig?: any;
}

type TabType = "doctor" | "security" | "user" | "clinic";

export function SettingsClient({
  user,
  currentDoctor,
  clinic,
  doctors,
  defaultConfig,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("doctor");
  const [isPending, startTransition] = useTransition();

  // Feedback states
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Selected doctor to edit
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    currentDoctor?.id || doctors[0]?.id || ""
  );

  const activeDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || currentDoctor;

  // Doctor Form State
  const [doctorForm, setDoctorForm] = useState({
    name: activeDoctor?.name || "",
    qualification: activeDoctor?.qualification || "",
    specialization: activeDoctor?.specialization || "",
    phone: activeDoctor?.phone || "",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // User Form State
  const [userForm, setUserForm] = useState({
    username: user?.username || "",
  });

  // Clinic Config Form State
  const [clinicForm, setClinicForm] = useState({
    name: clinic?.name || "",
    address: clinic?.address || "",
    phone: clinic?.phone || "",
  });

  const clearMessages = () => setStatusMessage(null);

  const handleDoctorSelect = (docId: string) => {
    setSelectedDoctorId(docId);
    clearMessages();
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setDoctorForm({
        name: doc.name,
        qualification: doc.qualification,
        specialization: doc.specialization,
        phone: doc.phone,
      });
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const res = await updateDoctorDetailsAction({
        doctorId: selectedDoctorId,
        name: doctorForm.name,
        qualification: doctorForm.qualification,
        specialization: doctorForm.specialization,
        phone: doctorForm.phone,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "Doctor details updated successfully.",
        });
        router.refresh();
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const res = await changePasswordAction({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "Password changed successfully.",
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const res = await updateUserDetailsAction({
        username: userForm.username,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "User details updated successfully.",
        });
        router.refresh();
      }
    });
  };

  const handleClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const res = await updateClinicConfigAction({
        clinicId: clinic.id,
        name: clinicForm.name,
        address: clinicForm.address,
        phone: clinicForm.phone,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "Clinic configuration updated successfully.",
        });
        router.refresh();
      }
    });
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "doctor", label: "Doctor Profile", icon: Stethoscope },
    { id: "security", label: "Password", icon: KeyRound },
    { id: "user", label: "User Account", icon: User },
    { id: "clinic", label: "Clinic Config", icon: Building2 },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage doctor profiles, security, login credentials, and clinic configurations.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                clearMessages();
              }}
              className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-1 ${
            statusMessage.type === "success"
              ? "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200"
              : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: Doctor Profile */}
      {activeTab === "doctor" && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Doctor Profile
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Update professional qualifications and contact details.
                </p>
              </div>
            </div>

            {doctors.length > 1 && (
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorSelect(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Doctor Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={doctorForm.name}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Dr. Anterpreet Kaur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                Qualifications
              </label>
              <input
                type="text"
                value={doctorForm.qualification}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    qualification: e.target.value,
                  })
                }
                placeholder="e.g. MBBS, MD (Medicine)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Specialization / Department
              </label>
              <input
                type="text"
                value={doctorForm.specialization}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    specialization: e.target.value,
                  })
                }
                placeholder="e.g. Internal Medicine & General Physician"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                Doctor Phone / Contact
              </label>
              <input
                type="tel"
                value={doctorForm.phone}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, phone: e.target.value })
                }
                placeholder="e.g. +91 98154 79938"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Doctor Details"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Change Password */}
      {activeTab === "security" && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update your account password for secure admin access.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={6}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isPending ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: User Details */}
      {activeTab === "user" && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                User Details
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage your login username and account details.
              </p>
            </div>
          </div>

          <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Login Username
              </label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm({ ...userForm, username: e.target.value })
                }
                required
                placeholder="e.g. anter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  Doctor / Administrator
                </span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-slate-500">{user.id}</span>
              </div>
              {user.createdAt && (
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save User Details"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Clinic Configuration */}
      {activeTab === "clinic" && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Clinic Configuration
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Clinic information, address, and consultation timings.
              </p>
            </div>
          </div>

          <form onSubmit={handleClinicSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Clinic Name
              </label>
              <input
                type="text"
                value={clinicForm.name}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, name: e.target.value })
                }
                required
                placeholder="e.g. Anter Medic Clinic"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Clinic Address
              </label>
              <input
                type="text"
                value={clinicForm.address}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, address: e.target.value })
                }
                required
                placeholder="e.g. Vincare Hospital Bathinda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                Clinic Helpline / Mobile
              </label>
              <input
                type="tel"
                value={clinicForm.phone}
                onChange={(e) =>
                  setClinicForm({ ...clinicForm, phone: e.target.value })
                }
                required
                placeholder="e.g. +91 98154 79938"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Timings summary info */}
            {defaultConfig?.workingHours && (
              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 flex flex-col gap-1.5 text-[11px] text-teal-900 dark:text-teal-200">
                <span className="font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Standard Schedule
                </span>
                <div className="flex justify-between">
                  <span>Morning Session:</span>
                  <span className="font-semibold">
                    {defaultConfig.workingHours.morning.start} -{" "}
                    {defaultConfig.workingHours.morning.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Evening Session:</span>
                  <span className="font-semibold">
                    {defaultConfig.workingHours.evening.start} -{" "}
                    {defaultConfig.workingHours.evening.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Slot Duration:</span>
                  <span className="font-semibold">
                    {defaultConfig.workingHours.slotDurationMinutes} mins
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Clinic Configuration"}</span>
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
