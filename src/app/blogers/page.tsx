"use client";
import { motion } from "framer-motion";

export default function Blogers() {
  const blogers = [
    { name: "АЛЕКСАНДР", followers: "1.2M", type: "LIFESTYLE" },
    { name: "ЕКАТЕРИНА", followers: "3.5M", type: "BEAUTY" },
    { name: "МАКСИМ", followers: "800K", type: "TECH" },
    { name: "АЛИНА", followers: "2.1M", type: "FASHION" },
    { name: "ДМИТРИЙ", followers: "5.4M", type: "ENTERTAINMENT" },
    { name: "СОФИЯ", followers: "1.9M", type: "TRAVEL" },
  ];
  
  return (
    <main className="min-h-screen pt-40 px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto pb-20">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16"
        >
          Медиа-личности
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogers.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
              className="group relative aspect-[3/4] bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden cursor-none shadow-2xl"
            >
              {/* Photo Placeholder Background */}
              <div className="absolute inset-0 bg-white/5 group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center">
                 <span className="text-8xl font-black opacity-[0.03]">{item.name[0]}</span>
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <p className="text-white/50 text-xs font-medium tracking-[0.2em] mb-3">{item.type}</p>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{item.name}</h3>
                  <div className="w-10 h-[1px] bg-white/30 mb-4" />
                  <p className="text-white font-mono text-sm tracking-widest">{item.followers} SUBS</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
