"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconEye,
  IconEyeOff,
  IconUser,
  IconPhone,
  IconMail,
  IconLoader2,
  IconUserPlus,
  IconLock,
} from "@tabler/icons-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) return setError("الرجاء إدخال الاسم بالكامل");
    if (!/^5\d{8}$/.test(phone)) return setError("رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام");
    if (password.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (password !== confirmPass) return setError("كلمة المرور غير متطابقة");

    setLoading(true);
    try {
      const result = await register(name, phone, password, email || undefined);
      sessionStorage.setItem("otp_phone", result.phone);
      sessionStorage.setItem("otp_purpose", result.purpose);
      sessionStorage.setItem("user_first_name", name.trim().split(" ")[0]);
      router.push("/verify-otp/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1" dir="rtl">
        <div className="mx-auto grid min-h-[calc(100vh-180px)] max-w-7xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Form side */}
          <div className="flex items-center justify-center px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] md:px-12 md:py-20">
            <div className="w-full max-w-md">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
                <IconUserPlus className="size-3.5" />
                حساب جديد
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl dark:text-white">
                مرحباً بك
              </h1>
              <p className="mt-2 text-sm text-neutral-500 md:text-base dark:text-neutral-400">
                أدخل بياناتك لإنشاء حسابك في النخبة
              </p>

              <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <InputField
                  label="الاسم بالكامل"
                  required
                  icon={<IconUser className="size-5" />}
                  value={name}
                  onChange={setName}
                  placeholder="الاسم بالكامل"
                  autoComplete="name"
                />

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    رقم الجوال <span className="text-red-500">*</span>
                  </label>
                  <div className="flex h-14 overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all focus-within:border-[#0b7a5a] focus-within:ring-2 focus-within:ring-[#0b7a5a]/15 dark:border-neutral-800 dark:bg-neutral-900">
                    <span className="flex items-center bg-neutral-50 px-4 text-sm font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      966+
                    </span>
                    <input
                      type="tel"
                      placeholder="5XXXXXXXX"
                      maxLength={9}
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-transparent px-4 text-base outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <span className="flex items-center px-4 text-neutral-400">
                      <IconPhone className="size-5" />
                    </span>
                  </div>
                </div>

                {/* Email (optional) */}
                <InputField
                  label="البريد الإلكتروني"
                  icon={<IconMail className="size-5" />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="اختياري"
                  dir="ltr"
                  autoComplete="email"
                />

                {/* Password */}
                <PasswordField
                  label="كلمة المرور"
                  required
                  value={password}
                  onChange={setPassword}
                  show={showPass}
                  toggle={() => setShowPass(!showPass)}
                  autoComplete="new-password"
                />

                {/* Confirm Password */}
                <PasswordField
                  label="تأكيد كلمة المرور"
                  required
                  value={confirmPass}
                  onChange={setConfirmPass}
                  show={showConfirm}
                  toggle={() => setShowConfirm(!showConfirm)}
                  autoComplete="new-password"
                />

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] text-base font-bold text-white shadow-lg shadow-[#0b7a5a]/25 transition-all hover:bg-[#0a6b4f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <IconLoader2 className="size-5 animate-spin" />}
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                عندك حساب؟{" "}
                <a href="/login/" className="font-bold text-[#0b7a5a] hover:underline dark:text-emerald-400">
                  تسجيل الدخول
                </a>
              </p>
            </div>
          </div>

          {/* Image side — desktop only */}
          <div className="relative hidden overflow-hidden md:flex md:items-center md:justify-center md:p-8">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-emerald-600/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03] [background-size:20px_20px] [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)]" />
            <img
              src="/login-side.png"
              alt="توثيق عقود إيجار"
              className="relative z-10 max-h-[700px] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InputField({
  label,
  required,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  dir,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all focus-within:border-[#0b7a5a] focus-within:ring-2 focus-within:ring-[#0b7a5a]/15 dark:border-neutral-800 dark:bg-neutral-900">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          autoComplete={autoComplete}
          className="w-full bg-transparent px-4 text-base outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
        />
        <span className="flex items-center px-4 text-neutral-400">{icon}</span>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  required,
  value,
  onChange,
  show,
  toggle,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all focus-within:border-[#0b7a5a] focus-within:ring-2 focus-within:ring-[#0b7a5a]/15 dark:border-neutral-800 dark:bg-neutral-900">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="w-full bg-transparent px-4 text-base outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
        />
        <button
          type="button"
          onClick={toggle}
          className="flex h-full items-center px-4 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          {show ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
        </button>
      </div>
    </div>
  );
}
