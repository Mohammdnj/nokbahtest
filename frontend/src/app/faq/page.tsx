"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    question: "كيف أقدر أوثّق عقدي؟",
    answer:
      "تدخل الموقع وتضغط على زر (أنشئ عقدك) — تختار نوع العقد سكني أو تجاري — تعبّي البيانات المطلوبة — تدفع الرسوم وخلاص، فريقنا يتكفّل بتوثيق عقدك في شبكة إيجار التابعة للهيئة العامة للعقار.",
  },
  {
    question: "العقد يطلع من إيجار ولا لا؟",
    answer:
      "أكيد، كل عقودنا إلكترونية وموثّقة رسمياً من شبكة إيجار التابعة للهيئة العامة للعقار. مو عقود ورقية أو عشوائية.",
  },
  {
    question: "كم رسوم العقد السكني للسنة؟",
    answer:
      "رسوم العقد السكني: 125 ريال رسوم حكومية + 74 ريال رسوم الوسيط العقاري = المجموع 199 ريال للسنة الواحدة.",
  },
  {
    question: "كم رسوم العقد التجاري للسنة؟",
    answer:
      "رسوم العقد التجاري: 200 ريال رسوم حكومية + 99 ريال رسوم الوسيط العقاري = المجموع 299 ريال للسنة الواحدة.",
  },
  {
    question: "بعد ما أدفع، متى يتوثّق العقد؟",
    answer:
      "خلال 30 دقيقة بإذن الله. نشتغل عليه مباشرة بعد استلام الطلب.",
  },
  {
    question: "وش الخدمات اللي تقدمونها؟",
    answer:
      "حالياً نقدّم توثيق عقود إيجار بين المالك والمستأجر، وكذلك تجديد العقود. لطلب تجديد عقد تواصل معنا عبر الواتساب على الرقم 0563214000.",
  },
  {
    question: "هل أنتم مرخصين؟",
    answer:
      "نعم، منشأة تجارية رسمية مسجلة بوزارة التجارة برقم 4650258662، ومعتمدين كوسيط عقاري من إيجار برقم عضوية 82591508، والمركز السعودي للأعمال برقم 0000018828، والهيئة العامة للعقار برقم 1200032615.",
  },
  {
    question: "مين يقدر يستفيد من الخدمة؟",
    answer:
      "أي شخص — سواء كنت مؤجر (مالك عقار)، مستأجر، وسيط عقاري، أو حتى مكتب خدمات عامة.",
  },
  {
    question: "فيه عقود ورقية؟",
    answer:
      "لا، ما نقدّم عقود ورقية أبداً. والعقد الورقي يعتبر مخالفة ممكن توصل غرامتها إلى 25 ألف ريال حسب الأنظمة.",
  },
  {
    question: "وش معنى إجمالي قيمة العقد؟",
    answer:
      "هو مجموع كل المبالغ اللي بتدفعها طول مدة العقد. يعني مبلغ الدفعة × عدد الدفعات.",
  },
  {
    question: "وش معنى رسوم السعي؟",
    answer:
      "هي أجرة الوسيط العقاري على خدمة التوثيق، وتُدفع مرة وحدة فقط.",
  },
  {
    question: "لو الكهرب أو الماء مشترك، كيف نتعامل؟",
    answer:
      "يتم الاتفاق بين المالك والمستأجر على مبلغ يُدفع بشكل دوري لفواتير الخدمات المشتركة (ماء / كهرب / غاز).",
  },
  {
    question: "هل العقد الإلكتروني معتمد عند الجهات الحكومية؟",
    answer:
      "إي طبعاً، العقد الموثّق من إيجار معتبر ومعتمد عند جميع الجهات القضائية بوزارة العدل وجميع الجهات الحكومية.",
  },
  {
    question: "هل تسجيل العقود بإيجار إلزامي؟",
    answer:
      "نعم، تسجيل عقود الإيجار السكنية والتجارية في شبكة إيجار إلزامي وفقاً لقرار مجلس الوزراء رقم 405.",
  },
  {
    question: "العقود مرتبطة بجهات حكومية ثانية؟",
    answer:
      "أكيد، العقود الإلكترونية مرتبطة بمركز المعلومات الوطني، وزارة التجارة، وزارة العدل، البريد السعودي، شركة المياه الوطنية، وجهات ثانية كثير.",
  },
  {
    question: "العقد ينفع لحساب المواطن والضمان؟",
    answer:
      "إي نعم، العقد الموثّق من إيجار مقبول عند حساب المواطن والضمان الاجتماعي المطوّر وحافز ونظام بلدي وغيرها.",
  },
  {
    question: "كيف أنهي العقد لو المستأجر طلع؟",
    answer:
      "إذا العقد محدد المدة ينتهي تلقائي بتاريخه. لو متجدد لازم أحد الطرفين ينهيه من خلال شبكة إيجار.",
  },
  {
    question: "كم يأخذ وقت تحويل مبلغ الإيجار للمالك؟",
    answer:
      "3 أيام عمل كحد أقصى للمبالغ المسددة عن طريق مدى.",
  },
  {
    question: "هل دفع الإيجار داخل إيجار إلزامي على العقود القديمة؟",
    answer:
      "لا، الإلزام يطبّق فقط على العقود السكنية الجديدة اللي بعد تاريخ الإلزام.",
  },
  {
    question: "لو عندي وكالة مشتركة كيف أسجّلها؟",
    answer:
      "لازم يكون فيه شخص واحد موكّل بصفته الشخصية مسؤول عن العقار في الوكالات المشتركة.",
  },
  {
    question: "عندي عقد استثمار لتأجير مبنى، وش أسوي؟",
    answer:
      "أول شي توثّق عقد إيجار لكامل المبنى، وبعدها تقدر تأجّر الوحدات بشكل مستقل على مستأجرين ثانيين.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <main className="flex-1" dir="rtl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-12 md:grid-cols-[1fr_2fr] md:px-8 md:py-24">
          <div>
            <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              مركز المساعدة
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 md:text-5xl dark:text-neutral-50">
              الأسئلة الشائعة
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 md:text-base dark:text-neutral-400">
              جمعنا لك أكثر الأسئلة اللي توصلنا من عملائنا. لو ما لقيت جوابك،
              كلمنا واتساب على{" "}
              <a
                href="https://wa.me/966563214000"
                className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                dir="ltr"
              >
                0563214000
              </a>
            </p>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                open={open}
                setOpen={setOpen}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FAQItem({
  question,
  answer,
  open,
  setOpen,
}: {
  question: string;
  answer: string;
  open: string | null;
  setOpen: (open: string | null) => void;
}) {
  const isOpen = open === question;

  return (
    <div
      className="cursor-pointer py-4"
      onClick={() => setOpen(isOpen ? null : question)}
    >
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 size-6 flex-shrink-0">
          <IconPlus
            className={cn(
              "absolute inset-0 size-6 transform text-emerald-600 transition-all duration-200 dark:text-emerald-400",
              isOpen && "rotate-90 scale-0",
            )}
          />
          <IconMinus
            className={cn(
              "absolute inset-0 size-6 rotate-90 scale-0 transform text-emerald-600 transition-all duration-200 dark:text-emerald-400",
              isOpen && "rotate-0 scale-100",
            )}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-800 md:text-base dark:text-neutral-200">
            {question}
          </h3>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs leading-relaxed text-neutral-500 md:text-sm dark:text-neutral-400">
                  {answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
