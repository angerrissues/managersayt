"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
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

  const [isLoading, setIsLoading] = useState(true);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
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
        className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 max-w-[600px] w-full relative my-auto shadow-2xl max-h-[95vh] flex flex-col"
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

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {!statsMedia || statsMedia.length === 0 ? (
            <div className="py-10 text-center text-white/50 bg-white/5 rounded-2xl border border-white/10">
              Статистика пока не загружена
            </div>
          ) : (
            statsMedia.map((mediaUrl, idx) => {
              const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);
              return (
                <div key={idx} className="w-full bg-black/50 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                  {isVideo ? (
                    <video 
                      src={mediaUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-auto object-contain bg-black"
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt={`Stats ${idx}`} 
                      className="w-full h-auto object-contain bg-black"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
