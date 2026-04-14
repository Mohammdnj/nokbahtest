"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff, IconLoader2, IconLockOpen, IconPhone } from "@tabler/icons-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^5\d{8}$/.test(phone)) {
      setError("رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const result = await login(phone, password);
      sessionStorage.setItem("otp_phone", result.phone);
      sessionStorage.setItem("otp_purpose", result.purpose);
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
                <IconLockOpen className="size-3.5" />
                تسجيل الدخول
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl dark:text-white">
                مرحباً بعودتك
              </h1>
              <p className="mt-2 text-sm text-neutral-500 md:text-base dark:text-neutral-400">
                ادخل رقم جوالك وكلمة المرور للدخول إلى حسابك
              </p>

              <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
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

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all focus-within:border-[#0b7a5a] focus-within:ring-2 focus-within:ring-[#0b7a5a]/15 dark:border-neutral-800 dark:bg-neutral-900">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent px-4 text-base outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="flex h-full items-center px-4 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showPass ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <input type="checkbox" className="size-4 rounded border-neutral-300 accent-[#0b7a5a]" />
                    تذكرني
                  </label>
                  <a href="#" className="text-sm font-bold text-[#0b7a5a] hover:underline dark:text-emerald-400">
                    نسيت كلمة السر؟
                  </a>
                </div>

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
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                ما عندك حساب؟{" "}
                <a href="/register/" className="font-bold text-[#0b7a5a] hover:underline dark:text-emerald-400">
                  إنشاء حساب
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
              className="relative z-10 max-h-[600px] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
