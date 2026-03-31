"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const allLogos = [
  { name: "شبكة إيجار", src: "/ejar-icon.svg" },
  { name: "الهيئة العامة للعقار", src: "/real-state-icon.svg" },
  { name: "المركز السعودي للأعمال", src: "/saudi-center-icon.svg" },
];

export default function TrustedBy() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % allLogos.length);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, currentIndex]);

  const logo = allLogos[currentIndex];

  return (
    <div className="relative z-20 px-5 py-10 md:px-8 md:py-20" dir="rtl">
      <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-center text-xl font-bold text-transparent md:text-3xl dark:from-white dark:to-neutral-500">
        مرخصين من قبل
      </h2>
      <div className="relative mt-10 flex h-16 w-full items-center justify-center md:mt-16 md:h-20">
        <AnimatePresence
          mode="popLayout"
          onExitComplete={() => setIsAnimating(false)}
        >
          <motion.div
            key={logo.name}
            initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -40, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-12 w-auto object-contain md:h-16 dark:invert"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
