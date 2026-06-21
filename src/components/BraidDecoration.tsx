"use client";
import { useScroll, motion, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BraidDecoration() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показывать декор только на страницах блогеров и кейсов
    if (pathname === "/blogers" || pathname === "/cases" || pathname?.startsWith("/blogers/") || pathname?.startsWith("/cases/")) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  const { scrollYProgress } = useScroll();
  // Делаем отрисовку очень плавной, с небольшой задержкой/инерцией
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  if (!isVisible) return null;

  // Абстрактные переплетающиеся пути (двойная+ спираль / коса)
  const path1 = "M 20 0 C 20 100, 80 100, 80 200 C 80 300, 20 300, 20 400 C 20 500, 80 500, 80 600 C 80 700, 20 700, 20 800 C 20 900, 80 900, 80 1000";
  const path2 = "M 80 0 C 80 100, 20 100, 20 200 C 20 300, 80 300, 80 400 C 80 500, 20 500, 20 600 C 20 700, 80 700, 80 800 C 80 900, 20 900, 20 1000";
  const path3 = "M 50 0 C 50 50, 80 50, 80 100 C 80 150, 20 150, 20 200 C 20 250, 50 250, 50 300 C 50 350, 80 350, 80 400 C 80 450, 20 450, 20 500 C 20 550, 50 550, 50 600 C 50 650, 80 650, 80 700 C 80 750, 20 750, 20 800 C 20 850, 50 850, 50 900 C 50 950, 80 950, 80 1000";

  return (
    <>
      {/* Левая коса */}
      <div className="fixed top-0 left-0 md:left-4 lg:left-8 h-screen w-[60px] md:w-[100px] lg:w-[140px] pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute top-0 left-0">
          <motion.path 
            d={path1} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="4" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
          <motion.path 
            d={path2} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="4" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
          <motion.path 
            d={path3} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.25)" 
            strokeWidth="3" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
        </svg>
      </div>

      {/* Правая коса (отзеркаленная) */}
      <div className="fixed top-0 right-0 md:right-4 lg:right-8 h-screen w-[60px] md:w-[100px] lg:w-[140px] pointer-events-none z-0 scale-x-[-1]">
        <svg width="100%" height="100%" viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute top-0 left-0">
          <motion.path 
            d={path1} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="4" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
          <motion.path 
            d={path2} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="4" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
          <motion.path 
            d={path3} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.25)" 
            strokeWidth="3" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }} 
          />
        </svg>
      </div>
    </>
  );
}
