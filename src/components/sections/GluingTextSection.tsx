"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function GluingTextSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  // Эффект склеивания при скролле
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["3vw", "-0.2vw"]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], [0.1, 0.9]);

  return (
    <section ref={containerRef} className="py-20 md:py-32 flex items-center justify-center bg-black overflow-hidden relative border-t border-white/5">
      <motion.div 
        style={{ letterSpacing, opacity: textOpacity }}
        className="w-full flex justify-center pointer-events-none select-none whitespace-nowrap text-[5vw] md:text-[6vw] lg:text-[8vw] font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-white to-gray-500"
      >
        우리는 우리 분야에서 최고입니다
      </motion.div>
    </section>
  );
}
