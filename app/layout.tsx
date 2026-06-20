import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import SubscriptionsAutoApply from "@/app/components/SubscriptionsAutoApply";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        <NavBar />
        <SubscriptionsAutoApply />
        {children}
      </body>
    </html>
  );
}
