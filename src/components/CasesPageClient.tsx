"use client";
import { motion } from "framer-motion";
import CasesGrid from "@/components/CasesGrid";
import type { Case } from "@/components/CasesGrid";

export default function CasesPageClient({ cases }: { cases: Case[] }) {
  return (
    <main className="min-h-screen pt-24 md:pt-40 px-4 md:px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto pb-20">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter mb-16"
        >
          Кейсы
        </motion.h1>
        
        <CasesGrid cases={cases} />
      </div>
    </main>
  );
}
