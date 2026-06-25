"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio() {
  // Кнопка активна с самого начала
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.2; // тихий фон

    const playAudio = () => {
      audio.play().catch(() => {
        // Браузеры могут блокировать автоплей без взаимодействия.
        // Ничего не делаем, обработчик взаимодействия (ниже) запустит музыку при клике.
      });
    };

    if (isPlaying) {
      playAudio();
    } else {
      audio.pause();
    }

    const handleInteraction = () => {
      if (isPlaying && audio.paused) {
        playAudio();
      }
    };

    // При любом взаимодействии пользователя, если автовоспроизведение не сработало, запускаем музыку
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("scroll", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("scroll", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [isPlaying]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не триггерить глобальный listener
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/Silk_and_Steel.mp3"
        loop
        autoPlay
        preload="auto"
      />
      <button
        onClick={toggleAudio}
        className="fixed top-4 right-16 md:top-6 md:right-6 z-[60] w-10 h-10 flex items-center justify-center text-white mix-blend-difference hover:opacity-70 transition-opacity"
        aria-label={isPlaying ? "Выключить звук" : "Включить звук"}
      >
        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>
    </>
  );
}
