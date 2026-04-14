"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconArrowRight, IconDeviceMobile } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = sessionStorage.getItem("otp_phone");
    const pr = sessionStorage.getItem("otp_purpose");
    if (!p || !pr) {
      router.replace("/login");
      return;
    }
    setPhone(p);
    setPurpose(pr);
    inputRefs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3 && newDigits.every((d) => d)) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowRight" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code?: string) => {
    const finalCode = code || digits.join("");
    if (finalCode.length !== 4) {
      setError("الرجاء إدخال رمز التحقق كاملاً");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const user = await verifyOtp(phone, finalCode, purpose);
      sessionStorage.setItem("user_first_name", user.name.split(" ")[0]);
      sessionStorage.removeItem("otp_phone");
      sessionStorage.removeItem("otp_purpose");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز التحقق غير صحيح");
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError("");
    try {
      await resendOtp(phone, purpose);
      setCountdown(60);
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة الإرسال");
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, 3)}****${phone.slice(-3)}` : "";

  return (
    <main className="flex min-h-screen flex-col bg-[#faf8ff] dark:bg-neutral-950" dir="rtl">
        <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/80">
          <div className="mx-auto flex h-16 max-w-md items-center justify-center px-5">
            <a href="/">
              <img src="/logolight.png" alt="النخبة" className="h-10 dark:hidden" />
              <img src="/logodark.png" alt="النخبة" className="hidden h-10 dark:block" />
            </a>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-5 py-8 pb-[max(3rem,env(safe-area-inset-bottom))]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-3xl bg-white p-6 shadow-[0_10px_40px_-12px_rgba(11,122,90,0.18)] md:p-8 dark:bg-neutral-900"
          >
            <div className="mb-6 flex justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0b7a5a] to-emerald-700 shadow-lg shadow-[#0b7a5a]/30"
              >
                <div className="absolute -inset-2 rounded-[28px] bg-emerald-500/10 blur-xl" />
                <IconDeviceMobile className="relative size-10 text-white" />
              </motion.div>
            </div>

            <h1 className="text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
              تحقق من رقم الجوال
            </h1>
            <p className="mt-3 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              أدخل الرمز المكوّن من 4 أرقام اللي وصلك على
              <br />
              <span dir="ltr" className="font-bold text-neutral-700 dark:text-neutral-300">
                +{maskedPhone}
              </span>
            </p>

            <div className="mt-8 flex justify-center gap-2.5 sm:gap-3" dir="ltr">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="size-16 rounded-2xl border-2 border-neutral-200 bg-white text-center text-3xl font-bold text-neutral-900 shadow-sm transition-all focus:border-[#0b7a5a] focus:outline-none focus:ring-4 focus:ring-[#0b7a5a]/15 sm:size-[68px] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={loading || digits.some((d) => !d)}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] text-base font-bold text-white shadow-lg shadow-[#0b7a5a]/25 transition-all hover:bg-[#0a6b4f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <IconLoader2 className="size-5 animate-spin" />
              ) : (
                <>
                  تحقق
                  <IconArrowRight className="size-4 rotate-180" />
                </>
              )}
            </button>

            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              لم يصلك الرمز؟{" "}
              {countdown > 0 ? (
                <span className="text-neutral-400">
                  إعادة الإرسال خلال <span className="font-bold">{countdown}</span> ثانية
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-[#0b7a5a] hover:underline disabled:opacity-60 dark:text-emerald-400"
                >
                  {resending ? "جاري الإرسال..." : "إعادة الإرسال"}
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.back()}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                تعديل رقم الجوال
              </button>
            </div>
          </motion.div>
        </div>
    </main>
  );
}
