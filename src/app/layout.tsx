import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/shared/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/ui/Navbar";

import FloatingContact from "@/components/shared/FloatingContact";
import Footer from "@/components/ui/Footer";
import AdminProvider from "@/components/shared/AdminProvider";
import BraidDecoration from "@/components/sections/BraidDecoration";
import BackgroundAudio from "@/components/ui/BackgroundAudio";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "82Agency | Маркетинговое агентство, реклама у блогеров",
  description: "Премиальное агентство инфлюенс-маркетинга 82Agency. Выводим бренды на международный уровень. Закажите эффективную рекламу у топовых блогеров.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`}>
        <AdminProvider>
          <BackgroundAudio />
          <SmoothScroll>
            <CustomCursor />
            <Navbar />
            <BraidDecoration />
            {children}
            <Footer />
            <FloatingContact />
          </SmoothScroll>
        </AdminProvider>
      </body>
    </html>
  );
}
