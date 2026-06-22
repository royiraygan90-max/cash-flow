import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import AppNav from "@/app/components/AppNav";
import SubscriptionsAutoApply from "@/app/components/SubscriptionsAutoApply";
import ToastProvider from "@/app/components/Toast";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "מאזן חודשי",
  description: "מעקב תזרים מזומנים אישי",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={rubik.variable} style={{ fontFamily: "Rubik, sans-serif" }}>
        <ToastProvider>
          <AppNav />
          <SubscriptionsAutoApply />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
