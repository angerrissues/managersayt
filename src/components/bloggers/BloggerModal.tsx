"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FaYoutube, FaInstagram, FaTelegramPlane, FaVk, FaTiktok } from "react-icons/fa";
import type { Blogger } from "@/types/blogger";
import SocialStatsModal from "@/components/shared/SocialStatsModal";

export default function BloggerModal({ blogger, onClose, mode = "default" }: { blogger: Blogger; onClose: () => void; mode?: "default" | "statistics" }) {
  const [selectedStats, setSelectedStats] = useState<{platform: string, url: string, statsMedia: string[]} | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSocialClick = (e: React.MouseEvent, platform: string, url: string, statsMedia?: string[]) => {
    if (mode === "statistics") {
      e.preventDefault();
      setSelectedStats({ platform, url, statsMedia: statsMedia || [] });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 lg:p-8 max-w-[1000px] w-full relative my-auto cursor-auto shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar"
          data-lenis-prevent="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 md:top-5 md:right-5 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-20 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column: Avatar & Basic Info */}
            <div className="md:w-1/3 shrink-0">
              <div className="max-h-[250px] md:max-h-none aspect-auto md:aspect-[3/4] rounded-2xl overflow-hidden mb-5 border border-white/10 shadow-inner">
                <img src={blogger.avatarPath} alt={blogger.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 text-white leading-tight">{blogger.name}</h2>
              <p className="text-white/60 mb-1 text-sm md:text-base">Гео: <span className="text-white">{blogger.geo}</span></p>
              <p className="text-white/60 mb-5 text-sm md:text-base">
                РКН: <span className={`ml-1 ${blogger.rknStatus ? "text-green-400 font-medium" : "text-red-400 font-medium"}`}>
                  {blogger.rknStatus ? "Зарегистрирован" : "Не зарегистрирован"}
                </span>
              </p>
              
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">По всем вопросам:</p>
                <a 
                  href={`https://t.me/${blogger.contact.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-mono text-white text-sm hover:text-blue-400 transition-colors underline decoration-white/30 hover:decoration-blue-400 underline-offset-4 cursor-pointer block"
                >
                  {blogger.contact}
                </a>
              </div>
            </div>

            {/* Right Column: Stats & Details */}
            <div className="md:w-2/3 flex flex-col gap-4">
              <h3 className="text-xl md:text-2xl font-bold mb-1 text-white uppercase tracking-wider border-b border-white/10 pb-3">Статистика</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(blogger.socials || {}).map(([key, data]) => {
                  if (!data) return null;

                  if (key.startsWith("tiktok")) {
                    return (
                      <a key={key} href={data.url} target="_blank" rel="noreferrer" onClick={(e) => handleSocialClick(e, "tiktok", data.url || "", data.statsMedia)} className="block p-3 md:p-4 bg-gradient-to-br from-[#25F4EE]/10 to-[#FE2C55]/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3 text-white">
                          <FaTiktok size={24} className="text-[#FE2C55] group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-lg">TikTok</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{data.followers}</span></p>
                          {data.views && <p className="text-sm text-white/60">Видео: <span className="text-white">{data.views}</span></p>}
                        </div>
                        {data.rknLink && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a href={data.rknLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300 hover:underline">✓ РКН Зарегистрирован</a>
                          </div>
                        )}
                      </a>
                    );
                  }

                  if (key.startsWith("youtube")) {
                    return (
                      <a key={key} href={data.url} target="_blank" rel="noreferrer" onClick={(e) => handleSocialClick(e, "youtube", data.url || "", data.statsMedia)} className="block p-3 md:p-4 bg-gradient-to-br from-red-500/10 to-red-900/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3 text-white">
                          <FaYoutube size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-lg">YouTube</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{data.followers}</span></p>
                          {data.horizontalViews && <p className="text-sm text-white/60">Гориз. видео: <span className="text-white">{data.horizontalViews}</span></p>}
                          {data.verticalViews && <p className="text-sm text-white/60">Вертикальные: <span className="text-white">{data.verticalViews}</span></p>}
                        </div>
                        {data.rknLink && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a href={data.rknLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300 hover:underline">✓ РКН Зарегистрирован</a>
                          </div>
                        )}
                      </a>
                    );
                  }

                  if (key.startsWith("instagram")) {
                    return (
                      <a key={key} href={data.url} target="_blank" rel="noreferrer" onClick={(e) => handleSocialClick(e, "instagram", data.url || "", data.statsMedia)} className="block p-3 md:p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3 text-white">
                          <FaInstagram size={24} className="text-pink-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-lg">Instagram</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{data.followers}</span></p>
                          {data.reelsViews && <p className="text-sm text-white/60">Reels: <span className="text-white">{data.reelsViews}</span></p>}
                          {data.storiesViews && <p className="text-sm text-white/60">Stories: <span className="text-white">{data.storiesViews}</span></p>}
                        </div>
                        {data.rknLink && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a href={data.rknLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300 hover:underline">✓ РКН Зарегистрирован</a>
                          </div>
                        )}
                      </a>
                    );
                  }

                  if (key.startsWith("telegram")) {
                    return (
                      <a key={key} href={data.url} target="_blank" rel="noreferrer" onClick={(e) => handleSocialClick(e, "telegram", data.url || "", data.statsMedia)} className="block p-3 md:p-4 bg-gradient-to-br from-blue-400/10 to-blue-600/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3 text-white">
                          <FaTelegramPlane size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-lg">Telegram</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{data.followers}</span></p>
                          {data.dailyViews && <p className="text-sm text-white/60">Суточные: <span className="text-white">{data.dailyViews}</span></p>}
                          {data.monthlyViews && <p className="text-sm text-white/60">Месячные: <span className="text-white">{data.monthlyViews}</span></p>}
                        </div>
                        {data.rknLink && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a href={data.rknLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300 hover:underline">✓ РКН Зарегистрирован</a>
                          </div>
                        )}
                      </a>
                    );
                  }

                  if (key.startsWith("vk")) {
                    return (
                      <a key={key} href={data.url} target="_blank" rel="noreferrer" onClick={(e) => handleSocialClick(e, "vk", data.url || "", data.statsMedia)} className="block p-3 md:p-4 bg-gradient-to-br from-[#0077FF]/10 to-[#0077FF]/5 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-3 text-white">
                          <FaVk size={24} className="text-[#0077FF] group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-lg">VK</span>
                        </div>
                        <div className="space-y-1">
                          {data.followers && <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{data.followers}</span></p>}
                          <p className="text-sm text-white/60">Сообщество ВК</p>
                        </div>
                        {data.rknLink && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a href={data.rknLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300 hover:underline">✓ РКН Зарегистрирован</a>
                          </div>
                        )}
                      </a>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Detailed Info */}
              {blogger.details && (
                <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  {blogger.details.title && <h4 className="text-xl md:text-2xl font-bold mb-3 text-white uppercase tracking-tight">{blogger.details.title}</h4>}
                  
                  <div className="space-y-3 text-sm md:text-base text-white/80">
                    {blogger.details.positioning && (
                      <p><span className="font-bold text-white">Позиционирование:</span> {blogger.details.positioning}</p>
                    )}
                    {blogger.details.about && (
                      <p><span className="font-bold text-white">О блогере:</span> {blogger.details.about}</p>
                    )}
                    {blogger.details.audience && (
                      <p><span className="font-bold text-white">Аудитория:</span> {blogger.details.audience}</p>
                    )}
                    {blogger.details.brands && (
                      <p><span className="font-bold text-white">Идеально для брендов:</span> {blogger.details.brands}</p>
                    )}
                    {blogger.details.format && (
                      <p><span className="font-bold text-white">Коронный формат:</span> {blogger.details.format}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedStats && (
          <SocialStatsModal 
            platform={selectedStats.platform}
            url={selectedStats.url}
            statsMedia={selectedStats.statsMedia}
            onClose={() => setSelectedStats(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
