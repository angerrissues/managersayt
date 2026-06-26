"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function KoreanFocusSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const xLeft = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [-5, 5]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [5, -5]);

  // Разделяем текст на слова для анимации размытия и появления
  const text = "Эксклюзивные контракты с блогерами из Кореи, Японии, Китая и других стран — с живой русскоязычной аудиторией. Ваш бренд звучит там, где раньше не было конкурентов.";
  const words = text.split(" ");

  return (
    <section
      ref={containerRef}
      className="py-20 md:py-32 px-4 md:px-6 bg-black relative z-20 border-t border-white/5 overflow-hidden flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh]"
    >
      {/* Massive Background Text with Parallax */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center pointer-events-none select-none z-0 opacity-40 md:opacity-20">
        <motion.h2
          style={{ x: xLeft, y, rotate: rotateLeft }}
          className="text-[25vw] md:text-[20vw] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 blur-sm md:blur-md"
        >
          SEOUL
        </motion.h2>
        <motion.h2
          style={{ x: xRight, y, rotate: rotateRight }}
          className="text-[25vw] md:text-[20vw] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-purple-500 to-blue-500 blur-sm md:blur-md"
        >
          VIBES
        </motion.h2>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 mb-8 md:mb-12">
          {/* Mobile Text (Hidden on Desktop) */}
          <div className="md:hidden text-lg sm:text-xl font-black uppercase tracking-widest text-white/80">
            82 AGENCY
          </div>
          
          {/* Desktop Flag (Hidden on Mobile) */}
          <motion.img
            src="https://hatscripts.github.io/circle-flags/flags/kr.svg"
            alt="South Korea Flag Left"
            className="hidden md:block w-24 h-24 lg:w-32 lg:h-32 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] shrink-0"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
          <h3 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[1.1] text-center">
            <span className="block">мы соединяем мировых блогеров</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
              с русскоязычной аудиторией
            </span>
          </h3>
          <motion.img
            src="https://hatscripts.github.io/circle-flags/flags/kr.svg"
            alt="South Korea Flag Right"
            className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] shrink-0 hidden md:block"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-x-2 md:gap-x-3 gap-y-1 md:gap-y-2 text-base md:text-xl lg:text-3xl font-light leading-relaxed text-white/70 max-w-4xl mx-auto px-2">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.03,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
