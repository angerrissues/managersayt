"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaYoutube, FaInstagram, FaTelegramPlane, FaVk, FaTiktok } from "react-icons/fa";
import type { Blogger } from "./BloggerGrid";

export default function BloggerModal({ blogger, onClose }: { blogger: Blogger; onClose: () => void }) {
  // Prevent body scroll when modal is open
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

  return (
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
        className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-8 max-w-4xl w-full relative my-auto cursor-auto shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 md:top-6 md:right-6 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-20 cursor-none magnetic"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:w-1/3 shrink-0">
            <div className="max-h-[250px] md:max-h-none aspect-auto md:aspect-[3/4] rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-inner">
              <img src={blogger.avatarPath} alt={blogger.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2 text-white">{blogger.name}</h2>
            <p className="text-white/60 mb-1">Гео: <span className="text-white">{blogger.geo}</span></p>
            <p className="text-white/60 mb-6">
              РКН: <span className={blogger.rknStatus ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                {blogger.rknStatus ? "Зарегистрирован" : "Не зарегистрирован"}
              </span>
            </p>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">По всем вопросам:</p>
              <p className="font-mono text-white text-sm">{blogger.contact}</p>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="md:w-2/3 flex flex-col gap-4 md:overflow-y-auto md:max-h-[60vh] md:pr-2 custom-scrollbar">
            <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-wider border-b border-white/10 pb-4">Статистика</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* TikTok */}
              {blogger.socials.tiktok && (
                <a href={blogger.socials.tiktok.url} target="_blank" rel="noreferrer" className="block p-3 md:p-5 bg-gradient-to-br from-[#25F4EE]/10 to-[#FE2C55]/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-none magnetic group">
                  <div className="flex items-center gap-3 mb-3 text-white">
                    <FaTiktok size={24} className="text-[#FE2C55] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">TikTok</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{blogger.socials.tiktok.followers}</span></p>
                    {blogger.socials.tiktok.views && <p className="text-sm text-white/60">Видео: <span className="text-white">{blogger.socials.tiktok.views}</span></p>}
                  </div>
                </a>
              )}

              {/* YouTube */}
              {blogger.socials.youtube && (
                <a href={blogger.socials.youtube.url} target="_blank" rel="noreferrer" className="block p-3 md:p-5 bg-gradient-to-br from-red-500/10 to-red-900/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-none magnetic group">
                  <div className="flex items-center gap-3 mb-3 text-white">
                    <FaYoutube size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">YouTube</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{blogger.socials.youtube.followers}</span></p>
                    {blogger.socials.youtube.horizontalViews && <p className="text-sm text-white/60">Гориз. видео: <span className="text-white">{blogger.socials.youtube.horizontalViews}</span></p>}
                    {blogger.socials.youtube.verticalViews && <p className="text-sm text-white/60">Вертикальные: <span className="text-white">{blogger.socials.youtube.verticalViews}</span></p>}
                  </div>
                </a>
              )}

              {/* Instagram */}
              {blogger.socials.instagram && (
                <a href={blogger.socials.instagram.url} target="_blank" rel="noreferrer" className="block p-3 md:p-5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-none magnetic group">
                  <div className="flex items-center gap-3 mb-3 text-white">
                    <FaInstagram size={24} className="text-pink-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Instagram</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{blogger.socials.instagram.followers}</span></p>
                    {blogger.socials.instagram.reelsViews && <p className="text-sm text-white/60">Reels: <span className="text-white">{blogger.socials.instagram.reelsViews}</span></p>}
                    {blogger.socials.instagram.storiesViews && <p className="text-sm text-white/60">Stories: <span className="text-white">{blogger.socials.instagram.storiesViews}</span></p>}
                  </div>
                </a>
              )}

              {/* Telegram */}
              {blogger.socials.telegram && (
                <a href={blogger.socials.telegram.url} target="_blank" rel="noreferrer" className="block p-3 md:p-5 bg-gradient-to-br from-blue-400/10 to-blue-600/10 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-none magnetic group">
                  <div className="flex items-center gap-3 mb-3 text-white">
                    <FaTelegramPlane size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Telegram</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Подписчики: <span className="text-white font-mono text-lg">{blogger.socials.telegram.followers}</span></p>
                    {blogger.socials.telegram.dailyViews && <p className="text-sm text-white/60">Суточные: <span className="text-white">{blogger.socials.telegram.dailyViews}</span></p>}
                    {blogger.socials.telegram.monthlyViews && <p className="text-sm text-white/60">Месячные: <span className="text-white">{blogger.socials.telegram.monthlyViews}</span></p>}
                  </div>
                </a>
              )}

              {/* VK */}
              {blogger.socials.vk && (
                <a href={blogger.socials.vk.url} target="_blank" rel="noreferrer" className="block p-3 md:p-5 bg-gradient-to-br from-[#0077FF]/10 to-[#0077FF]/5 border border-white/10 rounded-2xl hover:border-white/30 transition-colors cursor-none magnetic group">
                  <div className="flex items-center gap-3 mb-3 text-white">
                    <FaVk size={24} className="text-[#0077FF] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">VK</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Сообщество ВК</p>
                  </div>
                </a>
              )}

            </div>

            {/* Detailed Info */}
            {blogger.details && (
              <div className="mt-4 p-5 md:p-6 bg-white/5 border border-white/10 rounded-2xl">
                {blogger.details.title && <h4 className="text-xl md:text-2xl font-bold mb-4 text-white uppercase tracking-tight">{blogger.details.title}</h4>}
                
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
  );
}
