"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FloatingContact() {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Делаем физику более плавной, тягучей и мягкой
  const springConfig = { stiffness: 50, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    // Detect touch device
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsTouchDevice(isTouch);

    if (isTouch) return; // Skip mouse tracking on touch devices

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      
      // Радиус срабатывания магнита (в пикселях)
      const magneticRadius = 200;
      
      if (distance < magneticRadius) {
        // Сила притяжения (0.3 означает, что кнопка пройдёт 30% пути до курсора)
        x.set(distanceX * 0.3);
        y.set(distanceY * 0.3);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <div ref={ref} className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[100]">
      <motion.div style={isTouchDevice ? {} : { x: springX, y: springY }}>
        <Link href="https://t.me/manager_hanguki" target="_blank" className="relative flex items-center justify-center w-20 h-20 md:w-36 md:h-36 group cursor-none">
          
          {/* Вращающийся текст */}
          <motion.div 
            className="absolute inset-0 w-full h-full text-white pointer-events-none origin-center block"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <path
                id="circlePath"
                d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                fill="transparent"
              />
              <text className="text-[9.5px] font-bold uppercase tracking-[0.1em] fill-white opacity-80 group-hover:opacity-100 transition-opacity">
                <textPath href="#circlePath" startOffset="0%" textLength="220" lengthAdjust="spacing">
                  СВЯЗЬ С НАМИ • СВЯЗЬ С НАМИ • СВЯЗЬ С НАМИ •
                </textPath>
              </text>
            </svg>
          </motion.div>
          
          {/* Внутренний флаг/иконка */}
          <motion.div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-500"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          >
            <img 
              src="https://hatscripts.github.io/circle-flags/flags/kr.svg" 
              alt="Telegram Contact" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
