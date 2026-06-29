"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import BloggerGrid from "@/components/bloggers/BloggerGrid";
import type { Blogger } from "@/types/blogger";

export default function BlogersPageClient({ bloggers, mode = "default" }: { bloggers: Blogger[], mode?: "default" | "statistics" }) {
  // Helpers for sorting by TikTok followers
  const parseFollowers = (value?: string): number => {
    if (!value) return 0;
    let str = value.replace(/\s+/g, '').replace(',', '.').toLowerCase();
    
    let multiplier = 1;
    if (str.includes('k') || str.includes('к')) multiplier = 1000;
    else if (str.includes('m') || str.includes('м')) multiplier = 1000000;
    
    const numMatch = str.match(/[\d.]+/);
    if (!numMatch) return 0;
    
    const num = parseFloat(numMatch[0]);
    return isNaN(num) ? 0 : num * multiplier;
  };

  const getTikTokFollowers = (blogger: Blogger): number => {
    if (!blogger.socials) return 0;
    let maxFollowers = 0;
    for (const [key, social] of Object.entries(blogger.socials)) {
      if (key.toLowerCase().startsWith('tiktok') && social.followers) {
        const followers = parseFollowers(social.followers);
        if (followers > maxFollowers) maxFollowers = followers;
      }
    }
    return maxFollowers;
  };

  const sortedBloggers = [...bloggers].sort((a, b) => getTikTokFollowers(b) - getTikTokFollowers(a));

  return (
    <main className="min-h-screen pt-24 md:pt-40 px-4 md:px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto pb-20">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter mb-8"
        >
          {mode === "statistics" ? "Статистика" : "Медиа-личности"}
        </motion.h1>

        {/* Motivational Block for Joining */}
        {mode !== "statistics" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16 p-5 md:p-8 lg:p-12 border border-white/10 bg-white/[0.02] rounded-3xl backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
            
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold uppercase tracking-tight mb-4">Хочешь присоединиться к нам?</h2>
            <p className="text-white/60 text-base md:text-lg lg:text-xl font-light max-w-3xl mb-8 leading-relaxed">
              Стань частью эксклюзивного комьюнити топовых инфлюенсеров. Мы берем на себя всю рутину по рекламе, юридическим вопросам и продакшену, чтобы ты мог сфокусироваться на главном — творчестве.
            </p>
            
            <motion.div 
              className="inline-block rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(255, 255, 255, 0.4)", "0 0 0 20px rgba(255, 255, 255, 0)"] 
              }}
              transition={{ 
                boxShadow: { repeat: Infinity, duration: 2 },
                scale: { duration: 0.2 }
              }}
            >
              <Link href="/vacancies?form=blogger#lead-forms" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-full transition-colors duration-300 uppercase tracking-wider text-sm magnetic relative overflow-hidden group">
                <span className="relative z-10">Заполнить анкету</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </Link>
            </motion.div>
          </motion.div>
        )}
        
        <BloggerGrid bloggers={sortedBloggers} mode={mode} />
      </div>
    </main>
  );
}
