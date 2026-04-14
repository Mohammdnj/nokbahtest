"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconArrowRight } from "@tabler/icons-react";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <>
      <Navbar />
      <main className="flex-1" dir="rtl">
        <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md items-center justify-center px-5 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="mb-8 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                <svg className="size-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
              تحقق من رقم الجوال
            </h1>
            <p className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
              أدخل الرمز المكون من 4 أرقام الذي أرسلناه إلى
              <br />
              <span dir="ltr" className="font-bold text-neutral-700 dark:text-neutral-300">
                +{maskedPhone}
              </span>
            </p>

            <div className="mt-8 flex justify-center gap-3" dir="ltr">
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
                  className="size-14 rounded-xl border border-neutral-300 bg-white text-center text-2xl font-bold text-neutral-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 md:size-16 md:text-3xl dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={loading || digits.some((d) => !d)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                  إعادة الإرسال خلال {countdown} ثانية
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-emerald-600 hover:underline disabled:opacity-60 dark:text-emerald-400"
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
                رجوع
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
