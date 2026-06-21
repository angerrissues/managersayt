import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/ui/Navbar";

import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/ui/Footer";
import AdminProvider from "@/components/AdminProvider";
import BraidDecoration from "@/components/BraidDecoration";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "82 Agency | Рекламное агентство",
  description: "Премиальное агентство по работе с медиа-личностями",
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
