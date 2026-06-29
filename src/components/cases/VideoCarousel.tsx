"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VideoCarousel({ videos }: { videos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Helper to compress Cloudinary videos on the fly
  const optimizeCloudinaryVideo = (url: string) => {
    if (!url.includes("cloudinary.com/")) return url;
    if (url.includes("/upload/")) {
      if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return url;
  };

  // Play active video automatically, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        video.pause();
      }
    });
  }, [currentIndex]);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  if (!videos || videos.length === 0) return null;

  // Render only previous, current, and next videos to save memory but keep instant loading
  const renderIndices = [
    (currentIndex - 1 + videos.length) % videos.length,
    currentIndex,
    (currentIndex + 1) % videos.length
  ];
  const uniqueIndicesToRender = Array.from(new Set(renderIndices));

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      <div className="relative flex items-center justify-center group w-full">
        {/* Previous Button */}
        <button 
          onClick={prevVideo}
          className="absolute left-2 md:left-0 lg:-left-16 z-20 p-2 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md cursor-none magnetic"
        >
          <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
        </button>

        {/* Video Container - Strictly 9:16 format */}
        <div className="relative w-full max-w-[280px] md:max-w-[340px] aspect-[9/16] max-h-[60vh] md:max-h-[70vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          {videos.map((src, index) => {
            if (!uniqueIndicesToRender.includes(index)) return null;
            
            const isImage = /\.(jpe?g|png|webp|gif|avif)$/i.test(src) || src.includes('/image/upload/');
            const optimizedSrc = optimizeCloudinaryVideo(src);

            if (isImage) {
              return (
                <img
                  key={src}
                  src={optimizedSrc}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                  style={{
                    opacity: index === currentIndex ? 1 : 0,
                    zIndex: index === currentIndex ? 10 : 0
                  }}
                  alt="Media"
                />
              );
            }

            return (
              <video
                key={src}
                ref={(el) => {
                  if (!videoRefs.current) {
                    // @ts-ignore
                    videoRefs.current = [];
                  }
                  // @ts-ignore
                  videoRefs.current[index] = el;
                }}
                src={optimizedSrc}
                playsInline
                muted
                loop
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                style={{
                  opacity: index === currentIndex ? 1 : 0,
                  zIndex: index === currentIndex ? 10 : 0
                }}
              />
            );
          })}
        </div>

        {/* Next Button */}
        <button 
          onClick={nextVideo}
          className="absolute right-2 md:right-0 lg:-right-16 z-20 p-2 md:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md cursor-none magnetic"
        >
          <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex gap-2 mt-4 md:mt-8">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 cursor-none magnetic ${
              index === currentIndex ? "bg-white" : "bg-white/20 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
