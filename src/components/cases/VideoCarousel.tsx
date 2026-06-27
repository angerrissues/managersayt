"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VideoCarousel({ videos }: { videos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  if (!videos || videos.length === 0) return null;

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
          <AnimatePresence mode="wait">
            <motion.video
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={videos[currentIndex]}
              autoPlay
              playsInline
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          </AnimatePresence>
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
