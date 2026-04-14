"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  IconHome,
  IconBuildingStore,
  IconCheck,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type ContractType = "residential" | "commercial" | null;

const residentialTypes = [
  { id: "building", label: "عمارة", icon: "🏢" },
  { id: "apartment", label: "شقة", icon: "🏠" },
  { id: "villa", label: "فيلا", icon: "🏡" },
  { id: "room", label: "غرفة", icon: "🚪" },
];

const commercialTypes = [
  { id: "shop", label: "محل", icon: "🏪" },
  { id: "market", label: "سوق", icon: "🛒" },
  { id: "hotel", label: "فندق", icon: "🏨" },
  { id: "factory", label: "مصنع", icon: "🏭" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewContractModal({ open, onClose }: Props) {
  const router = useRouter();
  const [contractType, setContractType] = useState<ContractType>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleContinue = () => {
    if (!contractType || !propertyType) return;
    setShowInstructions(true);
  };

  const handleReady = () => {
    sessionStorage.setItem("contract_type", contractType!);
    sessionStorage.setItem("property_type", propertyType!);
    if (contractType === "commercial") {
      router.push("/contracts/new/commercial");
    } else {
      router.push("/contracts/new/residential");
    }
  };

  const handleClose = () => {
    setContractType(null);
    setPropertyType(null);
    setShowInstructions(false);
    onClose();
  };

  const types = contractType === "residential" ? residentialTypes : commercialTypes;

  return (
    <AnimatePresence>
      {open && !showInstructions && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            dir="rtl"
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10 dark:bg-neutral-900">
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              >
                <IconX className="size-5" />
              </button>

              <h2 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">
                إنشاء عقد إيجار
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                اختر نوع العقد، وخلنا نبدأ معك
              </p>

              {/* Contract type */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  نوع العقد
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TypeCard
                    selected={contractType === "residential"}
                    onClick={() => {
                      setContractType("residential");
                      setPropertyType(null);
                    }}
                    icon={<IconHome className="size-6" />}
                    title="إيجار سكني"
                    price="249 ر.س"
                  />
                  <TypeCard
                    selected={contractType === "commercial"}
                    onClick={() => {
                      setContractType("commercial");
                      setPropertyType(null);
                    }}
                    icon={<IconBuildingStore className="size-6" />}
                    title="إيجار تجاري"
                    price="349 ر.س"
                  />
                </div>
              </div>

              {/* Property type */}
              <AnimatePresence>
                {contractType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <h3 className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      نوع الوحدة
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {types.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setPropertyType(t.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 transition-all active:scale-[0.98] dark:bg-neutral-800",
                            propertyType === t.id
                              ? "border-[#0b7a5a] shadow-md shadow-[#0b7a5a]/10"
                              : "border-neutral-200 hover:border-[#0b7a5a]/40 dark:border-neutral-700"
                          )}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {contractType && propertyType && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={handleContinue}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f] active:scale-[0.98]"
                  >
                    المتابعة
                    <IconArrowLeft className="size-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}

      {open && showInstructions && (
        <InstructionsModal
          onClose={handleClose}
          onReady={handleReady}
          contractType={contractType}
        />
      )}
    </AnimatePresence>
  );
}

function TypeCard({
  selected,
  onClick,
  icon,
  title,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  price: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-right transition-all active:scale-[0.98] dark:bg-neutral-800",
        selected
          ? "border-[#0b7a5a] shadow-lg shadow-[#0b7a5a]/10"
          : "border-neutral-200 hover:border-[#0b7a5a]/40 dark:border-neutral-700"
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          selected
            ? "bg-[#0b7a5a] text-white"
            : "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-neutral-900 dark:text-white">{title}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">يبدأ من {price}</p>
      </div>
      {selected && (
        <div className="flex size-5 items-center justify-center rounded-full bg-[#0b7a5a]">
          <IconCheck className="size-3 text-white" />
        </div>
      )}
    </button>
  );
}

function InstructionsModal({
  onClose,
  onReady,
  contractType,
}: {
  onClose: () => void;
  onReady: () => void;
  contractType: ContractType;
}) {
  const price = contractType === "residential" ? "249" : "349";
  const fee1 = contractType === "residential" ? "125" : "200";
  const fee2 = contractType === "residential" ? "124" : "149";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8 dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
          >
            <IconX className="size-5" />
          </button>

          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
            <svg className="size-7 text-[#0b7a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">قبل ما نبدأ</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            عشان نخدمك بسرعة، جهّز معك التالي:
          </p>

          <ul className="mt-6 space-y-3">
            {[
              "معلومات هوية المؤجر والمستأجر",
              "جوال الطرفين المسجل في أبشر",
              "رقم الصك وتاريخه من المؤجر",
              "رقم الحساب البنكي (آيبان) للمؤجر",
              "الدور، المساحة، وعدد أدوار المبنى",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <IconCheck className="size-3 text-[#0b7a5a]" />
                </div>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{text}</span>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <IconCheck className="size-3 text-[#0b7a5a]" />
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                الرسوم: <span className="font-bold">{fee1} ريال</span> إيجار +{" "}
                <span className="font-bold">{fee2} ريال</span> الوسيط ={" "}
                <span className="font-bold text-[#0b7a5a]">{price} ريال</span>
              </span>
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              onClick={onReady}
              className="flex-1 rounded-2xl bg-[#0b7a5a] py-3 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f] active:scale-[0.98]"
            >
              جاهز، نبدأ
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
