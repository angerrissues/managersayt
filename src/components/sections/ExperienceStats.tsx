"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const stats = [
  { value: "3", label: "года на рынке" },
  { value: "30", label: "эксклюзивных инфлюенсеров" },
  { value: "100+", label: "рекламных кампаний" },
  { value: "100+", label: "миллионов охватов" },
];

export default function ExperienceStats() {
  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-black relative z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Column - Text content */}
        <div className="lg:w-1/3 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h4 className="text-white/40 uppercase tracking-widest text-xs md:text-sm font-semibold mb-4 md:mb-6">
              Наш опыт
            </h4>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold uppercase tracking-tight leading-tight mb-4 md:mb-8">
              Как мы добиваемся успеха для ваших брендов
            </h2>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-8 md:mb-12">
              Мы гордимся нашими успешными проектами, которые помогли множеству клиентов достичь своих целей.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Link 
              href="/cases" 
              className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-xs md:text-sm hover:bg-gray-200 transition-colors cursor-none magnetic group"
            >
              Смотреть кейсы
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Stats Grid */}
        <div className="lg:w-2/3 grid grid-cols-2 gap-3 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              className="p-5 md:p-10 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
            >
              <div className="text-3xl md:text-6xl lg:text-8xl font-black mb-2 md:mb-4 text-white">
                {stat.value}
              </div>
              <div className="text-sm md:text-xl lg:text-2xl text-white/50 uppercase tracking-tight font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
