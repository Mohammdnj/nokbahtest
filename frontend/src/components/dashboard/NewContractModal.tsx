"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  IconHome,
  IconBuildingStore,
  IconBuilding,
  IconBuildingSkyscraper,
  IconBuildingCommunity,
  IconDoor,
  IconShoppingBag,
  IconBuildingBank,
  IconBed,
  IconBuildingFactory2,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconFileText,
  IconMapPin,
  IconUser,
  IconUsers,
  IconRuler,
  IconCoin,
  IconShieldCheck,
  IconClock,
  IconFileCertificate,
  IconCreditCard,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type ContractType = "residential" | "commercial" | null;

interface PropertyTypeOption {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const residentialTypes: PropertyTypeOption[] = [
  { id: "building", label: "عمارة", Icon: IconBuildingCommunity },
  { id: "apartment", label: "شقة", Icon: IconBuilding },
  { id: "villa", label: "فيلا", Icon: IconHome },
  { id: "room", label: "غرفة", Icon: IconDoor },
];

const commercialTypes: PropertyTypeOption[] = [
  { id: "shop", label: "محل", Icon: IconShoppingBag },
  { id: "market", label: "سوق", Icon: IconBuildingStore },
  { id: "hotel", label: "فندق", Icon: IconBed },
  { id: "factory", label: "مصنع", Icon: IconBuildingFactory2 },
];

const wizardSteps = [
  { num: 1, label: "بيانات الصك", Icon: IconFileText },
  { num: 2, label: "العنوان الوطني", Icon: IconMapPin },
  { num: 3, label: "بيانات المالك", Icon: IconUser },
  { num: 4, label: "بيانات المستأجر", Icon: IconUsers },
  { num: 5, label: "بيانات الوحدة", Icon: IconRuler },
  { num: 6, label: "البيانات المالية", Icon: IconCoin },
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
      router.push("/contracts/new/commercial/");
    } else {
      router.push("/contracts/new/residential/");
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
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10 dark:bg-neutral-900">
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              >
                <IconX className="size-5" />
              </button>

              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
                <IconFileCertificate className="size-3.5" />
                بدء طلب جديد
              </div>
              <h2 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">
                إنشاء عقد إيجار
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                اختر نوع العقد، وخلنا نبدأ معك خطوة بخطوة
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
                    Icon={IconHome}
                    title="إيجار سكني"
                    description="شقة، فيلا، عمارة، غرفة"
                    price="249 ر.س"
                  />
                  <TypeCard
                    selected={contractType === "commercial"}
                    onClick={() => {
                      setContractType("commercial");
                      setPropertyType(null);
                    }}
                    Icon={IconBuildingStore}
                    title="إيجار تجاري"
                    description="محل، سوق، فندق، مصنع"
                    price="349 ر.س"
                  />
                </div>
              </div>

              {/* Property sub-type */}
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
                      {types.map((t) => {
                        const active = propertyType === t.id;
                        const Icon = t.Icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setPropertyType(t.id)}
                            className={cn(
                              "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-white p-4 transition-all active:scale-[0.98] dark:bg-neutral-800",
                              active
                                ? "border-[#0b7a5a] shadow-lg shadow-[#0b7a5a]/10"
                                : "border-neutral-200 hover:border-[#0b7a5a]/40 dark:border-neutral-700"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-11 items-center justify-center rounded-xl transition-colors",
                                active
                                  ? "bg-[#0b7a5a] text-white"
                                  : "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
                              )}
                            >
                              <Icon className="size-5" />
                            </div>
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                              {t.label}
                            </span>
                            {active && (
                              <div className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full bg-[#0b7a5a]">
                                <IconCheck className="size-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
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
          onBack={() => setShowInstructions(false)}
        />
      )}
    </AnimatePresence>
  );
}

function TypeCard({
  selected,
  onClick,
  Icon,
  title,
  description,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 bg-white p-5 text-right transition-all active:scale-[0.99] dark:bg-neutral-800",
        selected
          ? "border-[#0b7a5a] shadow-xl shadow-[#0b7a5a]/10"
          : "border-neutral-200 hover:border-[#0b7a5a]/40 dark:border-neutral-700"
      )}
    >
      {selected && (
        <div className="absolute -left-10 -top-10 size-24 rounded-full bg-[#0b7a5a]/10 blur-2xl" />
      )}
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl transition-colors",
            selected
              ? "bg-[#0b7a5a] text-white"
              : "bg-emerald-50 text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
        >
          <Icon className="size-6" />
        </div>
        {selected && (
          <div className="flex size-6 items-center justify-center rounded-full bg-[#0b7a5a]">
            <IconCheck className="size-4 text-white" />
          </div>
        )}
      </div>
      <h3 className="relative mt-4 text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
      <p className="relative mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      <p className="relative mt-3 text-sm font-bold text-[#0b7a5a] dark:text-emerald-400">
        يبدأ من {price}
      </p>
    </button>
  );
}

function InstructionsModal({
  onClose,
  onReady,
  onBack,
  contractType,
}: {
  onClose: () => void;
  onReady: () => void;
  onBack: () => void;
  contractType: ContractType;
}) {
  const price = contractType === "residential" ? "249" : "349";
  const fee1 = contractType === "residential" ? "125" : "200";
  const fee2 = contractType === "residential" ? "124" : "149";

  const requirements = [
    { Icon: IconUser, text: "هوية المؤجر والمستأجر" },
    { Icon: IconUsers, text: "جوال الطرفين المسجل في أبشر" },
    { Icon: IconFileText, text: "رقم الصك وتاريخه" },
    { Icon: IconCreditCard, text: "رقم الحساب البنكي (آيبان) للمؤجر" },
    { Icon: IconRuler, text: "الدور، المساحة، عدد أدوار المبنى" },
  ];

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
        <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10 dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
          >
            <IconX className="size-5" />
          </button>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-[#0b7a5a] dark:bg-emerald-950/40 dark:text-emerald-400">
            <IconShieldCheck className="size-3.5" />
            قبل أن نبدأ
          </div>

          <h2 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">
            الرحلة تتكون من 6 خطوات بسيطة
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            نقدّر وقتك — جهّز التالي وخلنا نبدأ مباشرة
          </p>

          {/* Timeline of 6 steps */}
          <div className="mt-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4 dark:border-neutral-800/60 dark:bg-neutral-800/30">
            <div className="relative">
              {/* connecting line */}
              <div className="absolute right-4 top-4 bottom-4 w-0.5 bg-emerald-200 dark:bg-emerald-900/40" />
              <ul className="space-y-3">
                {wizardSteps.map((step, idx) => {
                  const Icon = step.Icon;
                  return (
                    <motion.li
                      key={step.num}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative flex items-center gap-3"
                    >
                      <div className="relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[#0b7a5a] dark:bg-neutral-900">
                        <Icon className="size-4 text-[#0b7a5a] dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {step.num}. {step.label}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        خطوة {step.num}/6
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Requirements checklist */}
          <div className="mt-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              <IconShieldCheck className="size-4 text-[#0b7a5a]" />
              جهّز معك التالي
            </h3>
            <ul className="space-y-2">
              {requirements.map(({ Icon, text }, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white text-[#0b7a5a] dark:bg-neutral-900 dark:text-emerald-400">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee summary */}
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCoin className="size-5 text-[#0b7a5a] dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  إجمالي الرسوم
                </span>
              </div>
              <span className="text-lg font-bold text-[#0b7a5a] dark:text-emerald-400">
                {price} ر.س
              </span>
            </div>
            <p className="mt-2 text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
              {fee1} ر.س إيجار + {fee2} ر.س الوسيط (سنة واحدة)
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              onClick={onReady}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b7a5a] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0b7a5a]/20 transition-all hover:bg-[#0a6b4f] active:scale-[0.98]"
            >
              جاهز، نبدأ
              <IconArrowLeft className="size-4" />
            </button>
            <button
              onClick={onBack}
              className="flex-1 rounded-2xl border border-neutral-300 py-3.5 text-sm font-bold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              رجوع
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
