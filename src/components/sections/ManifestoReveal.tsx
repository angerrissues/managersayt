"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const rawText = `Мы ценим каждого партнера. Наш ростер — это отборные таланты и медиа-личности.
Мы глубоко погружаемся в проект, чтобы дать реальный результат:
РОСТ БРЕНДА • ЖИВАЯ АУДИТОРИЯ • КОНВЕРСИИ.
Ваш бюджет становится инвестицией.`;

export default function ManifestoReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Анимация начинается, когда блок чуть ниже середины,
    // и заканчивается, когда он в центре экрана
    offset: ["start 0.8", "center 0.4"],
  });

  const lines = rawText.split('\n');
  const totalWords = lines.reduce((acc, line) => acc + line.split(' ').length, 0);
  
  let wordGlobalIndex = 0;

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-40 px-4 md:px-6 relative z-20 bg-black flex justify-center items-center min-h-[80vh]"
    >
      <div 
        className="max-w-5xl w-full text-center"
        style={{ textWrap: "balance" } as any}
      >
        <div className="flex flex-col gap-y-6 md:gap-y-10">
          {lines.map((line, lineIndex) => {
            const isBullets = line.includes("РОСТ БРЕНДА");
            const words = line.split(" ");
            
            return (
              <div 
                key={lineIndex} 
                className={`flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.1em] ${
                  isBullets 
                    ? "text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-wide text-neutral-300 uppercase" 
                    : "text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
                }`}
              >
                {words.map((word, wordIndex) => {
                  const start = wordGlobalIndex / totalWords;
                  const end = start + 1 / totalWords;
                  wordGlobalIndex++;
                  const isAccent = word.toLowerCase().includes("инвестицией");
                  return (
                    <Word 
                      key={wordIndex} 
                      word={word} 
                      range={[start, end]} 
                      progress={scrollYProgress} 
                      isAccent={isAccent} 
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Word({
  word,
  range,
  progress,
  isAccent,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  isAccent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  
  if (isAccent) {
    return (
      <motion.span 
        style={{ opacity }} 
        className="inline-block text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] will-change-[opacity]"
      >
        {word}
      </motion.span>
    );
  }

  return (
    <motion.span 
      style={{ opacity }} 
      className="inline-block text-white will-change-[opacity]"
    >
      {word}
    </motion.span>
  );
}
