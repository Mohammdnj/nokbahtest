import type { Metadata } from "next";
import localFont from "next/font/local";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const ibmPlexArabic = localFont({
  src: [
    { path: "../../public/fonts/IBMPlexSansArabic-Thin.ttf", weight: "100" },
    { path: "../../public/fonts/IBMPlexSansArabic-ExtraLight.ttf", weight: "200" },
    { path: "../../public/fonts/IBMPlexSansArabic-Light.ttf", weight: "300" },
    { path: "../../public/fonts/IBMPlexSansArabic-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/IBMPlexSansArabic-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/IBMPlexSansArabic-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/IBMPlexSansArabic-Bold.ttf", weight: "700" },
  ],
  variable: "--font-ibm-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نقبة — عقد إيجار إلكتروني موثّق من شبكة إيجار",
  description:
    "وثّق عقدك الإيجاري بكل سهولة وأنت في مكانك خلال 25 دقيقة. خدمة احترافية معتمدة من شبكة إيجار لجميع مناطق المملكة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ibm-arabic)]">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
