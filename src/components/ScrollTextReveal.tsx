"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const WORDS = "Мы не работаем со всеми. Наш ростер — закрытый клуб медиа-личностей. Мы не гонимся за цифрами, а даем результат: рост бренда, живая аудитория и реальные конверсии. Ваш бюджет становится инвестицией.".split(" ");

export default function ScrollTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Анимация начинается, когда блок появляется внизу (90%),
    // и полностью завершается, когда центр блока доходит до середины экрана (40%)
    offset: ["start 0.9", "center 0.4"],
  });

  return (
    <section
      ref={containerRef}
      className="py-20 md:py-32 lg:py-48 px-4 md:px-6 relative z-20 bg-black flex justify-center"
    >
      <div className="max-w-4xl w-full">
        <p className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-medium leading-[1.3] tracking-tight flex flex-wrap gap-x-[0.25em] md:gap-x-[0.3em] gap-y-0.5 md:gap-y-1">
          {WORDS.map((word, i) => {
            const start = i / WORDS.length;
            const end = start + 1 / WORDS.length;
            return <Word key={i} word={word} range={[start, end]} progress={scrollYProgress} />;
          })}
        </p>
      </div>
    </section>
  );
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  const color = useTransform(progress, range, ["#555555", "#ffffff"]);

  return (
    <motion.span style={{ opacity, color }} className="inline-block will-change-[opacity,color] transition-none">
      {word}
    </motion.span>
  );
}
