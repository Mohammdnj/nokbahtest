"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { IconArrowRight, IconMenu2, IconCircleCheck } from "@tabler/icons-react";
import { ContractProvider, useContract } from "@/context/ContractContext";
import { useAuth } from "@/lib/auth-context";
import Stepper from "@/components/contract/Stepper";
import HeroTagline from "@/components/contract/HeroTagline";
import WhatsAppFooter from "@/components/contract/ui/WhatsAppFooter";
import Step1Deed from "@/components/contract/steps/Step1Deed";
import Step2Address from "@/components/contract/steps/Step2Address";
import Step3Owner from "@/components/contract/steps/Step3Owner";
import Step4Tenant from "@/components/contract/steps/Step4Tenant";
import Step5Unit from "@/components/contract/steps/Step5Unit";
import Step6Financial from "@/components/contract/steps/Step6Financial";

export default function CommercialContractPage() {
  return (
    <ContractProvider>
      <CommercialContractInner />
    </ContractProvider>
  );
}

function CommercialContractInner() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { contractId, contractNumber, currentStep, setStep, createDraft, loadDraft, submitContract, error } = useContract();

  const [success, setSuccess] = useState<{ number: string; fees: number } | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // Resume existing draft via query or create new
    const url = new URL(window.location.href);
    const existingId = url.searchParams.get("contract_id");

    const boot = async () => {
      try {
        if (existingId) {
          await loadDraft(Number(existingId));
        } else {
          await createDraft();
        }
      } catch {}
      setBooted(true);
    };
    boot();
  }, [authLoading, user, router, createDraft, loadDraft]);

  const handleNext = () => setStep(Math.min(currentStep + 1, 6));
  const handleBack = () => setStep(Math.max(currentStep - 1, 1));

  const handleFinalSubmit = async () => {
    try {
      const result = await submitContract();
      setSuccess({ number: result.contract_number, fees: result.total_fees });
    } catch {}
  };

  if (authLoading || !booted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff]">
        <div className="size-10 animate-spin rounded-full border-2 border-[#0b7a5a] border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return <SuccessScreen contractNumber={success.number} totalFees={success.fees} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-neutral-950" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/90 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <button onClick={() => setMenuOpen()} className="text-neutral-600 dark:text-neutral-400">
            <IconMenu2 className="size-6" />
          </button>
          <h1 className="text-sm font-bold text-neutral-800 md:text-base dark:text-neutral-200">
            إنشاء عقد إيجار تجاري
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <IconArrowRight className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <HeroTagline />

        <div className="mb-8 md:mb-10">
          <Stepper currentStep={currentStep} onStepClick={setStep} />
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-4xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && <Step1Deed onNext={handleNext} />}
            {currentStep === 2 && <Step2Address onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <Step3Owner onNext={handleNext} onBack={handleBack} />}
            {currentStep === 4 && <Step4Tenant onNext={handleNext} onBack={handleBack} />}
            {currentStep === 5 && <Step5Unit onNext={handleNext} onBack={handleBack} />}
            {currentStep === 6 && <Step6Financial onBack={handleBack} onSubmit={handleFinalSubmit} />}
          </motion.div>
        </AnimatePresence>

        <WhatsAppFooter />

        {contractId && contractNumber && (
          <p className="mt-6 text-center text-xs text-neutral-400">
            رقم العقد: <span dir="ltr">{contractNumber}</span>
          </p>
        )}
      </main>
    </div>
  );
}

// placeholder — menu hook-in for future
function setMenuOpen() {}

function SuccessScreen({ contractNumber, totalFees }: { contractNumber: string; totalFees: number }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-5 dark:bg-neutral-950" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-neutral-900"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
        >
          <IconCircleCheck className="size-12 text-[#0b7a5a]" />
        </motion.div>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          تم إنشاء عقدك بنجاح
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          سيتم مراجعة بياناتك وتوثيق العقد خلال 30 دقيقة
        </p>

        <div className="my-6 space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">رقم العقد</span>
            <span dir="ltr" className="font-bold text-neutral-800 dark:text-neutral-200">{contractNumber}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">إجمالي الرسوم</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalFees} ر.س</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-full bg-[#0b7a5a] py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f]"
          >
            الذهاب للوحة التحكم
          </button>
          <a
            href={`https://wa.me/966563214000?text=تم%20إنشاء%20عقدي%20رقم%20${contractNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full border-2 border-[#25D366] py-3 text-sm font-bold text-[#25D366] transition-all hover:bg-[#25D366]/5"
          >
            مشاركة عبر واتساب
          </a>
        </div>
      </motion.div>
    </div>
  );
}
