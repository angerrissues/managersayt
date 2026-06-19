"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <main ref={containerRef} className="min-h-[200vh] bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
        <h1 ref={titleRef} className="text-[12vw] font-black uppercase tracking-tighter leading-none text-center mix-blend-difference z-10">
          <div className="overflow-hidden">{splitText("Eighty Two")}</div>
          <div className="overflow-hidden">{splitText("Agency")}</div>
        </h1>
        
        <p className="subtitle mt-8 text-xl md:text-2xl font-light tracking-wide text-gray-400 text-center max-w-2xl z-10">
          Эксклюзивное представление интересов ведущих медиа-личностей и блогеров.
        </p>

        {/* Abstract shape for background depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-[0.02] rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* About / Transition Section */}
      <section className="min-h-screen flex items-center justify-center px-6 border-t border-white/5 relative z-20 bg-black">
        <div className="max-w-4xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-tight uppercase"
          >
            Мы создаем <span className="italic font-light text-gray-500 lowercase">тренды</span>,<br/>а не следуем им.
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center gap-6 mt-16"
          >
            <Link href="/blogers" className="magnetic px-10 py-5 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors duration-500 font-medium tracking-wide uppercase text-sm">
              Наши звезды
            </Link>
            <Link href="/cases" className="magnetic px-10 py-5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors duration-500 font-medium tracking-wide uppercase text-sm">
              Кейсы
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
