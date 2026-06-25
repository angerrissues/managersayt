"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.2; // тихий фон

    // Попытка автоматического воспроизведения
    const playAttempt = audio.play();
    if (playAttempt !== undefined) {
      playAttempt
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Автовоспроизведение заблокировано браузером
          setIsPlaying(false);
        });
    }

    // Слушатель для взаимодействия пользователя, если автовоспроизведение не сработало
    const handleFirstInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("scroll", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      }
    };

    if (!isPlaying) {
      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("scroll", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("scroll", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
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
