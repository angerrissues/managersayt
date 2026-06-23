"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import VideoCarousel from "@/components/cases/VideoCarousel";
import type { Case } from "@/types/case";
import BloggerModal from "@/components/bloggers/BloggerModal";
import type { Blogger } from "@/types/blogger";
import bloggersData from "@/data/bloggers.json";

function findBlogger(nameStr: string): Blogger | undefined {
  const lowerStr = nameStr.toLowerCase();
  
  const handleMatch = nameStr.match(/\(([^)]+)\)/);
  if (handleMatch) {
    const handle = handleMatch[1].toLowerCase();
    const found = (bloggersData as unknown as Blogger[]).find(b => 
      b.id.toLowerCase() === handle ||
      b.id.toLowerCase() === handle.replace(/[^a-z0-9]/g, '') ||
      b.socials?.tiktok?.url?.toLowerCase().includes(handle) ||
      b.socials?.instagram?.url?.toLowerCase().includes(handle)
    );
    if (found) return found;
  }
  
  return (bloggersData as unknown as Blogger[]).find(b => 
    lowerStr.includes(b.id.toLowerCase()) || 
    lowerStr.includes(b.name.toLowerCase())
  );
}

export default function CaseModal({ caseData, onClose }: { caseData: Case; onClose: () => void }) {
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { 
      document.body.style.overflow = ""; 
    };
  }, []);

  useEffect(() => {
    if (!selectedBlogger) {
      document.body.style.overflow = "hidden";
    }
  }, [selectedBlogger]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 lg:p-8 max-w-[1200px] w-full relative my-auto cursor-auto shadow-2xl flex flex-col lg:flex-row gap-10 max-h-[95vh] overflow-y-auto custom-scrollbar"
          data-lenis-prevent="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-50 cursor-none magnetic"
          >
            <X size={24} />
          </button>

          {/* Left Side: Info */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <p className="text-white/50 tracking-widest uppercase text-sm mb-2 font-mono">{caseData.agency}</p>
            <h2 className="text-3xl md:text-6xl font-black uppercase text-white tracking-tighter leading-none mb-4">{caseData.brand}</h2>
            <h3 className="text-2xl text-white/80 font-light mb-8 italic">{caseData.lineup}</h3>

            <div className="space-y-6">
              <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white/50 text-sm uppercase tracking-wider mb-4 font-bold">О кампании</p>
                {caseData.description && (
                  <p className="text-white/80 leading-relaxed mb-4">{caseData.description}</p>
                )}
                <ul className="space-y-3 text-white border-t border-white/10 pt-4 mt-4">
                  <li className="flex flex-col"><span className="text-white/40 text-xs mb-1 uppercase">Площадки</span> <span className="font-medium text-lg">{caseData.platforms.join(", ")}</span></li>
                </ul>
              </div>

              <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white/50 text-sm uppercase tracking-wider mb-4 font-bold">Блогеры ({caseData.bloggers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {caseData.bloggers.map((bloggerStr, i) => {
                    const matchedBlogger = findBlogger(bloggerStr);
                    return (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (matchedBlogger) setSelectedBlogger(matchedBlogger);
                        }}
                        className={`px-3 py-1.5 md:px-4 md:py-2 bg-white/10 border border-white/5 rounded-full text-xs md:text-sm transition-colors cursor-none ${
                          matchedBlogger 
                            ? 'text-white hover:bg-white/30 cursor-pointer underline decoration-white/30 underline-offset-4' 
                            : 'text-white/90 hover:bg-white/20'
                        }`}
                      >
                        {bloggerStr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Video Carousel */}
          <div className="lg:w-1/2 flex items-center justify-center bg-black/40 border border-white/5 rounded-3xl py-6 px-2 md:py-12 md:px-4 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-white opacity-[0.05] blur-[100px] pointer-events-none rounded-full" />
             <VideoCarousel videos={caseData.videos} />
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedBlogger && (
          <BloggerModal blogger={selectedBlogger} onClose={() => setSelectedBlogger(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
