"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { FaYoutube, FaInstagram, FaTelegramPlane, FaVk, FaTiktok } from "react-icons/fa";
import type { Blogger, Socials, BloggerDetails } from "./BloggerGrid";
import imageCompression from "browser-image-compression";
import { saveBlogger, getCloudinarySignature } from "@/actions/admin";

export default function BloggerEditModal({ 
  blogger, 
  onClose,
  onSave 
}: { 
  blogger: Blogger | Partial<Blogger>; 
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Blogger>>({
    id: blogger.id || crypto.randomUUID(),
    name: blogger.name || "",
    avatarPath: blogger.avatarPath || "/blogersphoto/placeholder.jpg",
    geo: blogger.geo || "Россия",
    rknStatus: blogger.rknStatus || false,
    contact: blogger.contact || "@manager_hanguki",
    socials: blogger.socials || {},
    details: blogger.details || {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Auto-compress large files to prevent Cloudinary 10MB limit error
      if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) { // Compress if > 2MB
        file = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
        });
      }

      // 1. Get Signature from backend
      const signatureData = await getCloudinarySignature();
      if (signatureData.error) throw new Error(signatureData.error);
      
      const { signature, timestamp, apiKey, cloudName } = signatureData;

      // 2. Upload directly to Cloudinary
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey!);
      uploadData.append("timestamp", timestamp!.toString());
      uploadData.append("signature", signature!);
      uploadData.append("folder", "manager_sayt");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: uploadData,
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        alert("Ошибка от сервера: " + (result.error?.message || "Cloudinary error"));
      } else if (result.secure_url) {
        setFormData({ ...formData, avatarPath: result.secure_url });
      }
    } catch (err) {
      alert("Ошибка при загрузке: " + err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await saveBlogger(formData);
      onSave();
      onClose();
    } catch (e) {
      alert("Ошибка сохранения: " + e);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocial = (network: keyof Socials, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [network]: {
          ...(prev.socials?.[network] || {}),
          [field]: value
        }
      }
    }));
  };

  const updateDetail = (field: keyof BloggerDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        [field]: value
      }
    }));
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
        className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 max-w-[1000px] w-full relative my-auto cursor-auto shadow-2xl max-h-[95vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 md:top-5 md:right-5 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-20 cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6 mt-6 md:mt-0">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:w-1/3 shrink-0 flex flex-col gap-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
              <img src={formData.avatarPath} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2"
                  disabled={isUploading}
                >
                  <Upload size={16} /> {isUploading ? "Загрузка..." : "Сменить фото"}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Имя блогера"
              className="text-2xl font-black uppercase tracking-tight text-white bg-white/5 border border-white/20 rounded-xl p-3 outline-none focus:border-red-500"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            
            <input 
              type="text" 
              placeholder="Гео (например: Россия)"
              className="text-sm text-white bg-white/5 border border-white/20 rounded-xl p-2 outline-none focus:border-red-500"
              value={formData.geo}
              onChange={e => setFormData({ ...formData, geo: e.target.value })}
            />

            <label className="flex items-center gap-2 text-white/80 cursor-pointer p-2 bg-white/5 border border-white/10 rounded-xl">
              <input 
                type="checkbox" 
                checked={formData.rknStatus}
                onChange={e => setFormData({ ...formData, rknStatus: e.target.checked })}
                className="w-4 h-4 accent-red-500"
              />
              РКН Зарегистрирован
            </label>

            <input 
              type="text" 
              placeholder="Контакт (@user)"
              className="text-sm font-mono text-white bg-white/5 border border-white/20 rounded-xl p-2 outline-none focus:border-red-500"
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
            />
            
            <input 
              type="text" 
              placeholder="Уникальный ID (англ)"
              className="text-xs text-white/50 bg-transparent border-b border-white/20 p-1 outline-none mt-4"
              value={formData.id}
              disabled={!!blogger.id} // cannot edit ID if it's existing
              onChange={e => setFormData({ ...formData, id: e.target.value })}
            />
          </div>

          {/* Right Column: Stats & Details */}
          <div className="md:w-2/3 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Соцсети</h3>
            
            <div className="space-y-4">
              {/* TikTok */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#FE2C55] font-bold"><FaTiktok /> TikTok</div>
                <input type="text" placeholder="URL" className="w-full text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.tiktok?.url || ""} onChange={e => updateSocial("tiktok", "url", e.target.value)} />
                <div className="flex gap-2">
                  <input type="text" placeholder="Подписчики (100К)" className="w-1/2 text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.tiktok?.followers || ""} onChange={e => updateSocial("tiktok", "followers", e.target.value)} />
                  <input type="text" placeholder="Просмотры (от 500к)" className="w-1/2 text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.tiktok?.views || ""} onChange={e => updateSocial("tiktok", "views", e.target.value)} />
                </div>
              </div>

              {/* Instagram */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-pink-500 font-bold"><FaInstagram /> Instagram</div>
                <input type="text" placeholder="URL" className="w-full text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.instagram?.url || ""} onChange={e => updateSocial("instagram", "url", e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Подписчики" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.instagram?.followers || ""} onChange={e => updateSocial("instagram", "followers", e.target.value)} />
                  <input type="text" placeholder="Reels" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.instagram?.reelsViews || ""} onChange={e => updateSocial("instagram", "reelsViews", e.target.value)} />
                  <input type="text" placeholder="Stories" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.instagram?.storiesViews || ""} onChange={e => updateSocial("instagram", "storiesViews", e.target.value)} />
                </div>
              </div>

              {/* YouTube */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold"><FaYoutube /> YouTube</div>
                <input type="text" placeholder="URL" className="w-full text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.youtube?.url || ""} onChange={e => updateSocial("youtube", "url", e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Подписчики" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.youtube?.followers || ""} onChange={e => updateSocial("youtube", "followers", e.target.value)} />
                  <input type="text" placeholder="Гориз. видео" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.youtube?.horizontalViews || ""} onChange={e => updateSocial("youtube", "horizontalViews", e.target.value)} />
                  <input type="text" placeholder="Вертикальные" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.youtube?.verticalViews || ""} onChange={e => updateSocial("youtube", "verticalViews", e.target.value)} />
                </div>
              </div>

              {/* Telegram */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold"><FaTelegramPlane /> Telegram</div>
                <input type="text" placeholder="URL" className="w-full text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.telegram?.url || ""} onChange={e => updateSocial("telegram", "url", e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Подписчики" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.telegram?.followers || ""} onChange={e => updateSocial("telegram", "followers", e.target.value)} />
                  <input type="text" placeholder="Суточные" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.telegram?.dailyViews || ""} onChange={e => updateSocial("telegram", "dailyViews", e.target.value)} />
                  <input type="text" placeholder="Месячные" className="text-sm bg-transparent border-b border-white/20 text-white p-1" value={formData.socials?.telegram?.monthlyViews || ""} onChange={e => updateSocial("telegram", "monthlyViews", e.target.value)} />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 mt-4">Детали</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Тематика (Lifestyle / Юмор)" className="w-full text-sm bg-white/5 border border-white/20 text-white p-2 rounded-xl" value={formData.details?.title || ""} onChange={e => updateDetail("title", e.target.value)} />
              <textarea placeholder="Позиционирование" className="w-full text-sm bg-white/5 border border-white/20 text-white p-2 rounded-xl min-h-[60px]" value={formData.details?.positioning || ""} onChange={e => updateDetail("positioning", e.target.value)} />
              <textarea placeholder="О блогере" className="w-full text-sm bg-white/5 border border-white/20 text-white p-2 rounded-xl min-h-[80px]" value={formData.details?.about || ""} onChange={e => updateDetail("about", e.target.value)} />
              <input type="text" placeholder="Аудитория" className="w-full text-sm bg-white/5 border border-white/20 text-white p-2 rounded-xl" value={formData.details?.audience || ""} onChange={e => updateDetail("audience", e.target.value)} />
              <input type="text" placeholder="Формат" className="w-full text-sm bg-white/5 border border-white/20 text-white p-2 rounded-xl" value={formData.details?.format || ""} onChange={e => updateDetail("format", e.target.value)} />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="mt-6 w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl uppercase tracking-wider transition-colors"
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
