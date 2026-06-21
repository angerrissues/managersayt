"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const rawText = `Мы не работаем со всеми. Наш ростер — закрытый клуб медиа-личностей.

Мы не гонимся за цифрами, а даем результат:
рост бренда,
живая аудитория
реальные конверсии.

Ваш бюджет становится инвестицией.|red`;

const lines = rawText.split('\n');
const totalWords = lines.reduce((acc, line) => {
  if (line.trim() === '') return acc;
  return acc + line.replace('|red', '').split(' ').length;
}, 0);

export default function ScrollTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Анимация начинается, когда блок появляется внизу (90%),
    // и полностью завершается, когда центр блока доходит до середины экрана (40%)
    offset: ["start 0.9", "center 0.4"],
  });

  let wordGlobalIndex = 0;

  return (
    <section
      ref={containerRef}
      className="py-20 md:py-32 lg:py-48 px-4 md:px-6 relative z-20 bg-black flex justify-center"
    >
      <div className="max-w-4xl w-full">
        <div className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-medium leading-[1.3] tracking-tight flex flex-col gap-y-0.5 md:gap-y-1">
          {lines.map((line, lineIndex) => {
            if (line.trim() === '') {
              return <div key={lineIndex} className="h-[0.75em]" aria-hidden="true" />;
            }
            
            const isRed = line.includes('|red');
            const cleanLine = line.replace('|red', '');
            const words = cleanLine.split(' ');
            
            return (
              <div key={lineIndex} className="flex flex-wrap gap-x-[0.25em] md:gap-x-[0.3em] gap-y-0.5 md:gap-y-1">
                {words.map((word, wordIndex) => {
                  const start = wordGlobalIndex / totalWords;
                  const end = start + 1 / totalWords;
                  wordGlobalIndex++;
                  return (
                    <Word 
                      key={wordIndex} 
                      word={word} 
                      range={[start, end]} 
                      progress={scrollYProgress} 
                      isRed={isRed} 
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
  isRed,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  isRed?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  const targetColor = isRed ? "#990000" : "#ffffff";
  const color = useTransform(progress, range, ["#555555", targetColor]);

  return (
    <motion.span style={{ opacity, color }} className="inline-block will-change-[opacity,color] transition-none">
      {word}
    </motion.span>
  );
}
