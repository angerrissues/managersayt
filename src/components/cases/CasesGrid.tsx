"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CaseModal from "./CaseModal";
import CaseEditModal from "./CaseEditModal";
import { useAdmin } from "@/components/shared/AdminProvider";
import type { Case } from "@/types/case";

export default function CasesGrid({ cases }: { cases: Case[] }) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [editingCase, setEditingCase] = useState<Partial<Case> | null>(null);
  const { isAdmin } = useAdmin();

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setEditingCase({})} 
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Добавить кейс
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {cases.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
            className="group cursor-none relative"
            onClick={() => setSelectedCase(item)}
          >
            <div className="aspect-video bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden relative shadow-xl">
              <div className="absolute inset-0 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 bg-white/5 flex items-center justify-center">
                {item.coverImage ? (
                  <img 
                    src={item.coverImage} 
                    alt={item.brand} 
                    className="w-full h-full object-contain p-2 md:p-4" 
                    style={item.removeWhiteBg || item.brand === 'Tornado Max Energy' ? { filter: 'grayscale(1) contrast(10) invert(1)', mixBlendMode: 'screen' } : {}}
                  />
                ) : (
                  <span className="text-4xl font-black uppercase tracking-widest opacity-10">{item.brand}</span>
                )}
              </div>
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm z-10">
                <span className="px-5 py-3 md:px-8 md:py-4 border border-white text-white rounded-full font-bold tracking-widest uppercase text-xs md:text-sm magnetic bg-black/20 hover:bg-white hover:text-black transition-colors duration-300">Смотреть кейс</span>
              </div>
            </div>
            
            <div className="mt-3 md:mt-6 flex justify-between items-start">
              <div>
                <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">{item.brand}</h3>
                <p className="text-white/60 mt-1 font-light text-sm md:text-lg">{item.lineup}</p>
              </div>
              <div className="px-2 py-1 md:px-4 md:py-2 border border-white/20 rounded-full text-[10px] md:text-xs font-mono tracking-widest text-white/50 uppercase">
                {item.agency}
              </div>
            </div>

            {isAdmin && (
              <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingCase(item); 
                  }} 
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow"
                >
                  Edit
                </button>
                <button 
                  onClick={async (e) => { 
                    e.stopPropagation(); 
                    if(confirm("Удалить?")) {
                      const { deleteCase } = await import("@/actions/admin");
                      await deleteCase(item.id);
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
        {selectedCase && !editingCase && (
          <CaseModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
        )}
        {editingCase && (
          <CaseEditModal 
            caseData={editingCase} 
            onClose={() => setEditingCase(null)} 
            onSave={() => {
              setEditingCase(null);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
