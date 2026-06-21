"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import LeadForms from "@/components/LeadForms";
import ExperienceStats from "@/components/ExperienceStats";
import KoreanFocusSection from "@/components/KoreanFocusSection";
import GluingTextSection from "@/components/GluingTextSection";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      // Инициализация анимации загрузки
      const tl = gsap.timeline();
      
      tl.from(".char", {
        y: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 1,
        ease: "power4.out",
        delay: 0.2,
      })
      .from(".subtitle", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      }, "-=0.5");
      
      // Параллакс эффект для заголовка при скролле
      gsap.to(titleRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block">{char === " " ? "\u00A0" : char}</span>
    ));
  };

  return (
    <main ref={containerRef} className="bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center px-4 md:px-6 relative overflow-hidden">
        
        {/* Top Marquee */}
        <div className="absolute top-16 md:top-32 left-0 w-[150%] -translate-x-[15%] rotate-[-3deg] opacity-20 pointer-events-none select-none z-0">
          <motion.div 
            className="flex whitespace-nowrap gap-4 md:gap-8"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[32px] md:text-[60px] lg:text-[100px] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}>
                우리는 우리 분야에서 최고입니다 &nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        {/* Bottom Marquee */}
        <div className="absolute bottom-16 md:bottom-32 left-0 w-[150%] -translate-x-[15%] rotate-[3deg] opacity-20 pointer-events-none select-none z-0">
          <motion.div 
            className="flex whitespace-nowrap gap-4 md:gap-8"
            animate={{ x: ["-50%", 0] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[32px] md:text-[60px] lg:text-[100px] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}>
                우리는 우리 분야에서 최고입니다 &nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        <h1 ref={titleRef} className="text-[15vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none text-center mix-blend-difference z-10">
          <div className="overflow-hidden">{splitText("82")}</div>
          <div className="overflow-hidden">{splitText("AGENCY")}</div>
        </h1>
        
        <p className="subtitle mt-4 md:mt-8 text-base md:text-xl lg:text-2xl font-light tracking-wide text-gray-400 text-center max-w-2xl z-10 px-4">
          Эксклюзивное представление интересов ведущих медиа-личностей и блогеров.
        </p>

        {/* Abstract shape for background depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-white opacity-[0.02] rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Experience Stats Section */}
      <ExperienceStats />

      {/* Korean Focus Section */}
      <KoreanFocusSection />

      {/* About / Transition Section */}
      <section className="min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center border-t border-white/5 relative z-20 bg-black overflow-hidden py-20 md:py-32">
        {/* Top Marquee */}
        <div className="absolute top-6 md:top-20 left-0 w-[150%] -translate-x-[15%] rotate-[-3deg] opacity-20 pointer-events-none select-none">
          <motion.div 
            className="flex whitespace-nowrap gap-4 md:gap-8"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[40px] md:text-[80px] lg:text-[150px] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}>
                우리 에이전시에는 최고만 있습니다 &nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        <div className="max-w-4xl text-center relative z-10 px-4 md:px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-6 md:mb-8 leading-tight uppercase"
          >
            Мы создаем <span className="italic font-light text-gray-500 lowercase">тренды</span>,<br/>а не следуем им.
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-10 md:mt-16"
          >
            <Link href="/blogers" className="magnetic px-8 py-4 md:px-10 md:py-5 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors duration-500 font-medium tracking-wide uppercase text-xs md:text-sm text-center">
              Наши звезды
            </Link>
            <Link href="/cases" className="magnetic px-8 py-4 md:px-10 md:py-5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-500 font-medium tracking-wide uppercase text-xs md:text-sm text-center">
              Кейсы
            </Link>
          </motion.div>
        </div>

        {/* Bottom Marquee */}
        <div className="absolute bottom-6 md:bottom-20 left-0 w-[150%] -translate-x-[15%] rotate-[3deg] opacity-20 pointer-events-none select-none">
          <motion.div 
            className="flex whitespace-nowrap gap-4 md:gap-8"
            animate={{ x: ["-50%", 0] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[40px] md:text-[80px] lg:text-[150px] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}>
                우리는 정직하게 일합니다 &nbsp;
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Scroll Text Reveal — "Почему мы" */}
      <ScrollTextReveal />

      {/* Эффект склеивания текста */}
      <GluingTextSection />

      {/* Lead Forms — заявки */}
      <LeadForms />
    </main>
  );
}
