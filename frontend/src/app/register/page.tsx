"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff, IconUser, IconPhone, IconMail, IconLoader2 } from "@tabler/icons-react";
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

    if (name.trim().length < 2) {
      setError("الرجاء إدخال الاسم بالكامل");
      return;
    }
    if (!/^5\d{8}$/.test(phone)) {
      setError("رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPass) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      const result = await register(name, phone, password, email || undefined);
      sessionStorage.setItem("otp_phone", result.phone);
      sessionStorage.setItem("otp_purpose", result.purpose);
      sessionStorage.setItem("user_first_name", name.trim().split(" ")[0]);
      router.push("/verify-otp");
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
        <div className="mx-auto grid min-h-[calc(100vh-200px)] max-w-7xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Form side */}
          <div className="flex items-center justify-center px-5 py-12 md:px-12 md:py-20">
            <div className="w-full max-w-md">
              <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
                مرحباً بك
              </h1>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                ادخل البيانات لإنشاء الحساب
              </p>

              <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-neutral-300 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                    <input
                      type="text"
                      placeholder="الاسم بالكامل"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <span className="px-3 text-neutral-400">
                      <IconUser className="size-5" />
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    رقم الجوال <span className="text-red-500">*</span>
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-neutral-300 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="flex items-center bg-neutral-50 px-3 text-sm text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                      966+
                    </span>
                    <input
                      type="tel"
                      placeholder="5XXXXXXXX"
                      maxLength={9}
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <span className="px-3 text-neutral-400">
                      <IconPhone className="size-5" />
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                    رقم الجوال المبدوء بـ 5 ويتكون من 9 أرقام
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    البريد الإلكتروني
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-neutral-300 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <span className="px-3 text-neutral-400">
                      <IconMail className="size-5" />
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-neutral-300 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="px-3 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showPass ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    تأكيد كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-neutral-300 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="تأكيد كلمة المرور"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="px-3 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showConfirm ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <IconLoader2 className="size-4 animate-spin" />}
                  إنشاء حساب
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                عندك حساب؟{" "}
                <a href="/login" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
                  تسجيل الدخول
                </a>
              </p>
            </div>
          </div>

          {/* Image side with gradient effect */}
          <div className="relative hidden overflow-hidden md:flex md:items-center md:justify-center md:p-8">
            {/* Gradient blobs */}
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-emerald-600/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
            {/* Dot pattern */}
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
