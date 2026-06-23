"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { FaYoutube, FaInstagram, FaTelegramPlane, FaVk, FaTiktok } from "react-icons/fa";

type SocialStatsModalProps = {
  platform: string;
  url: string;
  statsMedia: string[];
  onClose: () => void;
};

const ICONS: Record<string, any> = {
  tiktok: { icon: FaTiktok, color: "text-[#FE2C55]" },
  youtube: { icon: FaYoutube, color: "text-red-500" },
  instagram: { icon: FaInstagram, color: "text-pink-500" },
  telegram: { icon: FaTelegramPlane, color: "text-blue-400" },
  vk: { icon: FaVk, color: "text-[#0077FF]" },
};

export default function SocialStatsModal({ platform, url, statsMedia, onClose }: SocialStatsModalProps) {
  const IconData = ICONS[platform] || { icon: ExternalLink, color: "text-white" };
  const Icon = IconData.icon;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNext = () => {
    if (statsMedia && statsMedia.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % statsMedia.length);
    }
  };

  const handlePrev = () => {
    if (statsMedia && statsMedia.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + statsMedia.length) % statsMedia.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 max-w-[600px] w-full relative my-auto shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 md:top-5 md:right-5 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-20 cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6 pt-4">
          <Icon className={`text-5xl mb-4 ${IconData.color}`} />
          <h2 className="text-2xl font-black uppercase text-white tracking-widest mb-4">
            Статистика {platform}
          </h2>
          <a 
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`w-full text-center font-bold uppercase tracking-wider py-4 rounded-xl transition-colors bg-white text-black hover:bg-gray-200 shadow-lg`}
          >
            Перейти в {platform}
          </a>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden rounded-2xl min-h-[300px]">
          {!statsMedia || statsMedia.length === 0 ? (
            <div className="py-10 text-center text-white/50 bg-white/5 rounded-2xl border border-white/10 w-full h-full flex items-center justify-center">
              Статистика пока не загружена
            </div>
          ) : (
            <>
              {statsMedia.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev} 
                    className="absolute left-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="absolute right-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex items-center justify-center bg-black/50 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg"
                >
                  {statsMedia[currentIndex].match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video 
                      src={statsMedia[currentIndex]} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      onClick={() => setIsFullscreen(true)}
                      className="max-h-[60vh] w-auto object-contain bg-black cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <img 
                      src={statsMedia[currentIndex]} 
                      alt={`Stats ${currentIndex}`} 
                      onClick={() => setIsFullscreen(true)}
                      className="max-h-[60vh] w-auto object-contain bg-black cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {statsMedia.length > 1 && (
                <div className="absolute bottom-4 flex gap-2 z-10">
                  {statsMedia.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && statsMedia && statsMedia.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4 backdrop-blur-xl"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-50 cursor-pointer"
            >
              <X size={32} />
            </button>
            
            {statsMedia.length > 1 && (
              <>
                <button 
                  onClick={handlePrev} 
                  className="absolute left-4 md:left-8 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={handleNext} 
                  className="absolute right-4 md:right-8 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + "-fs"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center relative"
              >
                {statsMedia[currentIndex].match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video 
                    src={statsMedia[currentIndex]} 
                    autoPlay 
                    loop 
                    controls
                    playsInline
                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                  />
                ) : (
                  <img 
                    src={statsMedia[currentIndex]} 
                    alt={`Fullscreen ${currentIndex}`} 
                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
