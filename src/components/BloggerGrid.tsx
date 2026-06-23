"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BloggerModal from "./BloggerModal";
import BloggerEditModal from "./BloggerEditModal";
import { useAdmin } from "./AdminProvider";

export type Socials = {
  [key: string]: {
    url?: string;
    followers?: string;
    views?: string;
    horizontalViews?: string;
    verticalViews?: string;
    reelsViews?: string;
    storiesViews?: string;
    dailyViews?: string;
    monthlyViews?: string;
    statsMedia?: string[];
    rknLink?: string;
  };
};

export type BloggerDetails = {
  title?: string;
  positioning?: string;
  about?: string;
  audience?: string;
  brands?: string;
  format?: string;
};

export type Blogger = {
  id: string;
  name: string;
  avatarPath: string;
  geo: string;
  rknStatus: boolean;
  contact: string;
  socials: Socials;
  details?: BloggerDetails;
};

export default function BloggerGrid({ bloggers, mode = "default" }: { bloggers: Blogger[], mode?: "default" | "statistics" }) {
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null);
  const { isAdmin } = useAdmin();

  const [editingBlogger, setEditingBlogger] = useState<Partial<Blogger> | null>(null);

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setEditingBlogger({})} 
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Добавить блогера
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {bloggers.map((blogger, i) => (
          <motion.div
            key={blogger.id}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.05, type: "spring", stiffness: 100, damping: 20 }}
            className="group relative aspect-[3/4] bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden cursor-none shadow-2xl"
            onClick={() => setSelectedBlogger(blogger)}
          >
            {/* Photo */}
            <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]">
              <img src={blogger.avatarPath} alt={blogger.name} className="w-full h-full object-cover opacity-80" />
            </div>

            {/* Mobile: always-visible name overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 z-10 md:hidden">
              <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
                <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] mb-1">{blogger.geo}</p>
                <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight">{blogger.name}</h3>
              </div>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 hidden md:flex flex-col justify-end p-8">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <p className="text-white/50 text-xs font-medium tracking-[0.2em] mb-3">{blogger.geo}</p>
                <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">{blogger.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-2 h-2 rounded-full ${blogger.rknStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-xs font-mono text-white/70">РКН: {blogger.rknStatus ? 'Зарегистрирован' : 'Нет'}</span>
                </div>
                
                <button className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider text-sm rounded-full hover:bg-gray-200 transition-colors cursor-none magnetic">
                  Подробнее
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingBlogger(blogger); 
                  }} 
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow"
                >
                  Edit
                </button>
                <button 
                  onClick={async (e) => { 
                    e.stopPropagation(); 
                    if(confirm("Удалить?")) {
                      const { deleteBlogger } = await import("@/actions/admin");
                      await deleteBlogger(blogger.id);
                      window.location.reload();
                    }
                  }} 
                  className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow"
                >
                  Del
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBlogger && !editingBlogger && (
          <BloggerModal blogger={selectedBlogger} onClose={() => setSelectedBlogger(null)} mode={mode} />
        )}
        {editingBlogger && (
          <BloggerEditModal 
            blogger={editingBlogger} 
            onClose={() => setEditingBlogger(null)} 
            onSave={() => {
              setEditingBlogger(null);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
