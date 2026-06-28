"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getCases } from "@/actions/admin";
import type { Case } from "@/types/case";

const stats = [
  { value: "3", label: "года на рынке" },
  { value: "30", label: "эксклюзивных инфлюенсеров" },
  { value: "100+", label: "рекламных кампаний" },
  { value: "100+", label: "миллионов охватов" },
];

export default function ExperienceStats() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    getCases().then(res => {
      const allCases = res as unknown as Case[];
      // Filter out cases that have no coverImage
      setCases(allCases.filter(c => c.coverImage));
    });
  }, []);

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
          {stats.map((stat, index) => {
            const isTargetCard = stat.value === "100+" && stat.label === "рекламных кампаний";
            const isHovered = hoveredCard === stat.value;
            
            return (
              <motion.div
                layout
                key={index}
                onHoverStart={() => { if (isTargetCard) setHoveredCard(stat.value) }}
                onHoverEnd={() => { if (isTargetCard) setHoveredCard(null) }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className="p-5 md:p-10 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl backdrop-blur-sm hover:bg-white/[0.05] transition-colors overflow-hidden flex flex-col justify-center"
              >
                <motion.div layout>
                  <div className="text-3xl md:text-6xl lg:text-8xl font-black mb-2 md:mb-4 text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-xl lg:text-2xl text-white/50 uppercase tracking-tight font-medium">
                    {stat.label}
                  </div>
                </motion.div>

                {isTargetCard && cases.length > 0 && (
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <div className="flex overflow-hidden relative -mx-2 md:-mx-4 w-[calc(100%+16px)] md:w-[calc(100%+32px)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                          <motion.div
                            className="flex gap-3 md:gap-4 pr-3 md:pr-4"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, ease: "linear", duration: cases.length * 2 }}
                          >
                            {[...cases, ...cases, ...cases, ...cases].map((c, i) => (
                              <div 
                                key={i} 
                                className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-white/5 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-white/10"
                              >
                                <img 
                                  src={c.coverImage!} 
                                  alt={c.brand} 
                                  className="w-full h-full object-contain"
                                  style={c.removeWhiteBg || c.brand === 'Tornado Max Energy' ? { filter: 'grayscale(1) contrast(10) invert(1)', mixBlendMode: 'screen' } : {}}
                                />
                              </div>
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
