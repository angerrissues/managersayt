"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus } from "lucide-react";
import type { Case } from "@/types/case";
import { saveCase, getCloudinarySignature, getBloggers } from "@/actions/admin";
import type { Blogger } from "@/types/blogger";
import imageCompression from "browser-image-compression";

function AutoTextarea({ value, onChange, placeholder, minHeight = "100px" }: { value: string, onChange: (v: string) => void, placeholder: string, minHeight?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea 
      ref={ref}
      placeholder={placeholder} 
      className="w-full text-white/80 leading-relaxed bg-black/20 border border-white/10 p-3 rounded-xl outline-none focus:border-red-500 resize-none overflow-hidden" 
      style={{ minHeight }}
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  );
}

export default function CaseEditModal({ 
  caseData, 
  onClose,
  onSave 
}: { 
  caseData: Case | Partial<Case>; 
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Case>>({
    id: caseData.id || crypto.randomUUID(),
    brand: caseData.brand || "",
    lineup: caseData.lineup || "",
    agency: caseData.agency || "82 Agency",
    description: caseData.description || "",
    platforms: caseData.platforms || [],
    bloggers: caseData.bloggers || [],
    coverImage: caseData.coverImage || "",
    videos: caseData.videos || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [allBloggers, setAllBloggers] = useState<Blogger[]>([]);
  const [bloggerInput, setBloggerInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    getBloggers().then(res => setAllBloggers(res as unknown as Blogger[]));
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);

      if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
        file = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
        });
      }

      const signatureData = await getCloudinarySignature();
      if (signatureData.error) throw new Error(signatureData.error);
      
      const { signature, timestamp, apiKey, cloudName } = signatureData;

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
        setFormData({ ...formData, coverImage: result.secure_url });
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
      await saveCase(formData);
      onSave();
      onClose();
    } catch (e) {
      alert("Ошибка сохранения: " + e);
    } finally {
      setIsSaving(false);
    }
  };

  const addBlogger = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!formData.bloggers?.includes(trimmed)) {
      setFormData({ ...formData, bloggers: [...(formData.bloggers || []), trimmed] });
    }
    setBloggerInput("");
    setShowSuggestions(false);
  };

  const removeBlogger = (name: string) => {
    setFormData({ ...formData, bloggers: (formData.bloggers || []).filter(b => b !== name) });
  };

  const suggestions = allBloggers
    .filter(b => 
      b.name.toLowerCase().includes(bloggerInput.toLowerCase()) || 
      b.id.toLowerCase().includes(bloggerInput.toLowerCase())
    )
    .filter(b => !formData.bloggers?.includes(b.name) && !formData.bloggers?.includes(b.id));

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
        className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-6 max-w-[1000px] w-full relative my-auto cursor-auto shadow-2xl flex flex-col lg:flex-row gap-10 max-h-[95vh] overflow-y-auto"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 md:top-6 md:right-6 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-50 cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Left Side: Info */}
        <div className="lg:w-1/2 flex flex-col justify-center gap-4">
          <input 
            type="text" 
            placeholder="ID (только англ, без пробелов)" 
            className="text-white/50 text-xs border-b border-white/20 bg-transparent p-1 outline-none" 
            value={formData.id} 
            disabled={!!caseData.id}
            onChange={e => setFormData({ ...formData, id: e.target.value })} 
          />

          <input 
            type="text" 
            placeholder="Agency (например: 82 Agency)" 
            className="text-white/50 tracking-widest uppercase text-sm mb-2 font-mono bg-white/5 border border-white/20 p-2 rounded-xl outline-none focus:border-red-500" 
            value={formData.agency} 
            onChange={e => setFormData({ ...formData, agency: e.target.value })} 
          />

          <input 
            type="text" 
            placeholder="Название бренда" 
            className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mb-2 bg-white/5 border border-white/20 p-3 rounded-xl outline-none focus:border-red-500 w-full" 
            value={formData.brand} 
            onChange={e => setFormData({ ...formData, brand: e.target.value })} 
          />

          <input 
            type="text" 
            placeholder="Заголовок (например: Продвижение продукта)" 
            className="text-xl text-white/80 font-light mb-4 italic bg-white/5 border border-white/20 p-2 rounded-xl outline-none focus:border-red-500 w-full" 
            value={formData.lineup} 
            onChange={e => setFormData({ ...formData, lineup: e.target.value })} 
          />

          <div className="space-y-6">
            <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
              <p className="text-white/50 text-sm uppercase tracking-wider font-bold">О кампании</p>
              
              <AutoTextarea 
                placeholder="Описание кейса..." 
                minHeight="100px"
                value={formData.description || ""}
                onChange={v => setFormData({ ...formData, description: v })}
              />
              
              <div className="pt-2">
                <p className="text-white/40 text-xs mb-1 uppercase">Площадки (через запятую)</p>
                <input 
                  type="text" 
                  placeholder="YouTube, TikTok, VK..." 
                  className="w-full font-medium text-lg text-white bg-black/20 border border-white/10 p-3 rounded-xl outline-none focus:border-red-500" 
                  value={(formData.platforms || []).join(", ")} 
                  onChange={e => setFormData({ ...formData, platforms: e.target.value.split(",").map(s => s.trim()) })} 
                />
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/50 text-sm uppercase tracking-wider mb-4 font-bold">Блогеры</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.bloggers?.map((bloggerName, i) => {
                  const isExisting = allBloggers.some(b => b.name === bloggerName || b.id === bloggerName);
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${
                        isExisting ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-dashed border-white/30 text-white/70'
                      }`}
                    >
                      <span>{bloggerName}</span>
                      <button onClick={() => removeBlogger(bloggerName)} className="hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="relative">
                <div className="flex items-center bg-black/20 border border-white/10 rounded-xl px-3 focus-within:border-red-500">
                  <input 
                    type="text" 
                    placeholder="Введите имя блогера..." 
                    className="w-full text-sm text-white bg-transparent p-3 outline-none" 
                    value={bloggerInput} 
                    onChange={e => {
                      setBloggerInput(e.target.value);
                      setShowSuggestions(true);
                    }} 
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBlogger(bloggerInput);
                      }
                    }}
                  />
                  <button onClick={() => addBlogger(bloggerInput)} className="text-white/50 hover:text-white p-2">
                    <Plus size={18} />
                  </button>
                </div>

                <AnimatePresence>
                  {showSuggestions && bloggerInput.trim() !== "" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto shadow-2xl"
                    >
                      {suggestions.length > 0 ? (
                        suggestions.map(b => (
                          <button
                            key={b.id}
                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                            onClick={() => addBlogger(b.name)}
                          >
                            <span>{b.name}</span>
                            <span className="text-white/30 text-xs">@{b.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-white/50 italic">
                          Нажмите + или Enter, чтобы добавить как нового (вручную)
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl uppercase tracking-wider transition-colors"
          >
            {isSaving ? "Сохранение..." : "Сохранить кейс"}
          </button>
        </div>

        {/* Right Side: Media Editing */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-4">
            <h3 className="text-white font-bold uppercase w-full">Обложка (Превью)</h3>
            <div className="w-full aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/20 relative group flex items-center justify-center">
              {formData.coverImage ? (
                <img 
                  src={formData.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-contain p-2" 
                  style={formData.removeWhiteBg || formData.brand === 'Tornado Max Energy' ? { filter: 'grayscale(1) contrast(10) invert(1)', mixBlendMode: 'screen' } : {}}
                />
              ) : (
                <p className="text-white/30 text-sm">Нет обложки</p>
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2"
                  disabled={isUploading}
                >
                  <Upload size={16} /> {isUploading ? "Загрузка..." : "Сменить обложку"}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <input 
                type="checkbox" 
                id="removeBg" 
                className="w-4 h-4 cursor-pointer accent-red-500"
                checked={!!formData.removeWhiteBg}
                onChange={e => setFormData({ ...formData, removeWhiteBg: e.target.checked })}
              />
              <label htmlFor="removeBg" className="text-white/80 text-sm cursor-pointer select-none">
                Сделать лого белым и убрать фон (как у Торнадо)
              </label>
            </div>

            {/* Videos */}
            <div className="bg-black/40 p-4 sm:p-5 border border-white/5 rounded-2xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
                  ВИДЕО КЕЙСА (MP4 / SHORTS / REELS)
                </h3>
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  Загрузить видео
                  <input 
                    type="file" 
                    accept="video/*" 
                    multiple
                    className="hidden" 
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      
                      try {
                        setIsUploading(true);
                  
                        const signatureData = await getCloudinarySignature();
                        if (signatureData.error) throw new Error(signatureData.error);
                        const { signature, timestamp, apiKey, cloudName } = signatureData;
                  
                        const newUrls: string[] = [];
                  
                        for (const file of files) {
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
                          if (res.ok && result.secure_url) {
                            newUrls.push(result.secure_url);
                          } else {
                            alert(`Ошибка загрузки ${file.name}: ` + (result.error?.message || "Cloudinary error"));
                          }
                        }
                  
                        if (newUrls.length > 0) {
                          setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), ...newUrls] }));
                        }
                      } catch (err) {
                        alert("Ошибка при загрузке видео: " + err);
                      } finally {
                        setIsUploading(false);
                        if (e.target) e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-white/50 mb-2">Каждая ссылка на новой строке. Можно вставить ссылку или загрузить файлы кнопкой выше.</div>
                <AutoTextarea 
                  placeholder="https://..." 
                  value={(formData.videos || []).join("\n")} 
                  onChange={v => setFormData({ ...formData, videos: v.split("\n").filter(val => val.trim() !== "") })} 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
