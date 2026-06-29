"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCases } from "@/actions/admin";
import type { Case } from "@/types/case";

const stats = [
  { value: "3", label: "года на рынке" },
  { value: "30", label: "эксклюзивных инфлюенсеров", linkMobile: "/blogers" },
  { value: "100+", label: "рекламных кампаний", linkMobile: "/cases" },
  { value: "100+", label: "миллионов охватов", linkMobile: "/blogers" },
];

export default function ExperienceStats() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [randomVideos, setRandomVideos] = useState<string[]>([]);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredIndex(3);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 300);
  };

  // Helper to compress Cloudinary videos on the fly
  const optimizeCloudinaryVideo = (url: string) => {
    if (!url.includes("cloudinary.com/")) return url;
    if (url.includes("/upload/")) {
      if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return url;
  };

  useEffect(() => {
    getCases().then(res => {
      const allCases = res as unknown as Case[];
      // Filter out cases that have no coverImage
      setCases(allCases.filter(c => c.coverImage));

      // Extract random videos
      const vids = allCases.flatMap(c => c.videos || []);
      const uniqueVids = Array.from(new Set(vids));
      const shuffled = uniqueVids.sort(() => 0.5 - Math.random());
      setRandomVideos(shuffled.slice(0, 8)); // Pick 8 random videos
    });
  }, []);

  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://i.ytimg.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return null;
  };

  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-black relative z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Left Column - Text content */}
        <div className="lg:w-1/3 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h4 className="text-white/40 uppercase tracking-widest text-xs md:text-sm font-semibold mb-4 md:mb-6">
              Наш опыт
            </h4>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold uppercase tracking-tight leading-tight mb-4 md:mb-8">
              Как мы добиваемся успеха для ваших брендов
            </h2>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-8 md:mb-12">
              Мы гордимся нашими успешными проектами, которые помогли множеству клиентов достичь своих целей.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Link
              href="/cases"
              className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-xs md:text-sm hover:bg-gray-200 transition-colors cursor-none magnetic group"
            >
              Смотреть кейсы
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Stats Grid */}
        <div className="lg:w-2/3 grid grid-cols-2 gap-3 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const isCampaignsCard = index === 2; // 100+ рекламных кампаний
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                layout
                key={index}
                onHoverStart={() => {
                  setHoveredIndex(index);
                  if (index === 3) handleMouseEnter();
                }}
                onHoverEnd={() => {
                  setHoveredIndex(null);
                  if (index === 3) handleMouseLeave();
                }}
                onClick={() => {
                  if (stat.linkMobile && window.innerWidth < 768) {
                    router.push(stat.linkMobile);
                  }
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className="p-5 md:p-10 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl backdrop-blur-sm hover:bg-white/[0.05] transition-colors overflow-hidden flex flex-col justify-center cursor-default"
              >
                <motion.div layout>
                  <div className="text-3xl md:text-6xl lg:text-8xl font-black mb-2 md:mb-4 text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-xl lg:text-2xl text-white/50 uppercase tracking-tight font-medium">
                    {stat.label}
                  </div>
                </motion.div>

                {isCampaignsCard && cases.length > 0 && (
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <div className="flex overflow-hidden relative -mx-2 md:-mx-4 w-[calc(100%+16px)] md:w-[calc(100%+32px)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                          <motion.div
                            className="flex gap-4 md:gap-6 pr-4 md:pr-6"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, ease: "linear", duration: cases.length * 3 }}
                          >
                            {[...cases, ...cases, ...cases, ...cases].map((c, i) => (
                              <div
                                key={i}
                                className="w-20 h-20 md:w-28 md:h-28 shrink-0 bg-white/5 rounded-2xl overflow-hidden p-3 md:p-5 flex items-center justify-center border border-white/10"
                              >
                                <img
                                  src={c.coverImage!}
                                  alt={c.brand}
                                  className="w-full h-full object-contain"
                                  style={c.removeWhiteBg || c.brand === 'Tornado Max Energy' ? { filter: 'grayscale(1) contrast(10) invert(1)', mixBlendMode: 'screen' } : {}}
                                />
                              </div>
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Full width Video Marquee for "100+ миллионов охватов" (index 3) */}
      <AnimatePresence>
        {hoveredIndex === 3 && randomVideos.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 40 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full overflow-hidden max-w-[1920px] mx-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <motion.div
                className="flex gap-4 md:gap-6 pr-4 md:pr-6"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: randomVideos.length * 4 }}
              >
                {[...randomVideos, ...randomVideos, ...randomVideos].map((url, i) => {
                  const thumb = getYouTubeThumbnail(url);
                  const optimizedUrl = optimizeCloudinaryVideo(url);
                  const isImage = /\.(jpe?g|png|webp|gif|avif)$/i.test(url) || url.includes('/image/upload/');
                  
                  return (
                    <div 
                      key={i} 
                      className="w-40 h-[284px] md:w-64 md:h-[455px] shrink-0 bg-[#0a0a0a] rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center border border-white/10 group relative"
                    >
                      {thumb ? (
                        <img 
                          src={thumb} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : isImage ? (
                        <img 
                          src={optimizedUrl} 
                          alt="Media thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <HoverVideo url={optimizedUrl} index={i} />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function HoverVideo({ url, index }: { url: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Stagger the loading of video metadata to prevent browser connection overload
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, index * 200); // 200ms delay per video
    return () => clearTimeout(timer);
  }, [index]);
  
  if (!shouldLoad) {
    return <div className="w-full h-full bg-[#111] animate-pulse" />;
  }

  return (
    <video
      ref={videoRef}
      src={`${url}#t=0.1`}
      muted
      playsInline
      loop
      preload="metadata"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0.1;
        }
      }}
    />
  );
}
