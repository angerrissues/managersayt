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
  metadataBase: new URL("https://82agency.net"),
  title: "82Agency | Маркетинговое агентство, реклама у блогеров",
  description: "Премиальное агентство инфлюенс-маркетинга 82Agency. Выводим бренды на международный уровень. Закажите эффективную рекламу у топовых блогеров.",
  openGraph: {
    title: "82Agency | Маркетинговое агентство",
    description: "Премиальное агентство инфлюенс-маркетинга 82Agency. Выводим бренды на международный уровень.",
    url: "https://82agency.net",
    siteName: "82Agency",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "82Agency Preview",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "82Agency | Маркетинговое агентство",
    description: "Премиальное агентство инфлюенс-маркетинга 82Agency. Выводим бренды на международный уровень.",
    images: ["/og-image.jpg"],
  },
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
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </body>
    </html>
  );
}
