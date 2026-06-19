"use client";
import { motion } from "framer-motion";

export default function Cases() {
  const cases = [1, 2, 3, 4];
  
  return (
    <main className="min-h-screen pt-40 px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto pb-20">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16"
        >
          Кейсы
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {cases.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="group cursor-none"
            >
              <div className="aspect-video bg-white/5 border border-white/10 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Image Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-white/20 font-light text-2xl">
                  CASE PROJECT {item}
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wide">Бренд {item}</h3>
                  <p className="text-gray-400 mt-2 font-light">Масштабная интеграция и посевы</p>
                </div>
                <div className="px-4 py-2 border border-white/20 rounded-full text-xs tracking-widest text-white/60">
                  2024
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
