"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Case } from "@/types/case";
import CaseModal from "./CaseModal";
import CaseEditModal from "./CaseEditModal";
import { useAdmin } from "@/components/shared/AdminProvider";

export default function CaseFolderModal({
  parentCase,
  subCases,
  onClose,
}: {
  parentCase: Case;
  subCases: Case[];
  onClose: () => void;
}) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [editingCase, setEditingCase] = useState<Partial<Case> | null>(null);
  const { isAdmin } = useAdmin();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-4 md:p-8 max-w-[1200px] w-full relative my-auto cursor-auto shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar"
          data-lenis-prevent="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 p-3 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-50 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="mb-8 pr-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none mb-2">
              {parentCase.brand} <span className="text-white/30">— Интеграции</span>
            </h2>
            <p className="text-white/50 text-sm md:text-base font-light">
              Выберите кампанию для просмотра подробностей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {subCases.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group cursor-pointer relative"
                onClick={() => setSelectedCase(item)}
              >
                <div className="aspect-video bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden relative shadow-xl">
                  <div className="absolute inset-0 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 bg-white/5 flex items-center justify-center">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.brand}
                        className="w-full h-full object-contain p-2 md:p-4"
                        style={
                          item.removeWhiteBg || item.brand === "Tornado Max Energy"
                            ? { filter: "grayscale(1) contrast(10) invert(1)", mixBlendMode: "screen" }
                            : {}
                        }
                      />
                    ) : (
                      <span className="text-2xl font-black uppercase tracking-widest opacity-10 text-center px-4">
                        {item.brand}
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm z-10">
                    <span className="px-4 py-2 border border-white text-white rounded-full font-bold tracking-widest uppercase text-[10px] md:text-xs bg-black/20 hover:bg-white hover:text-black transition-colors duration-300">
                      Смотреть
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white line-clamp-1">
                    {item.brand}
                  </h3>
                  <p className="text-white/60 mt-0.5 font-light text-xs md:text-sm line-clamp-1">
                    {item.lineup}
                  </p>
                </div>

                {isAdmin && (
                  <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCase(item);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 md:p-2 rounded-full shadow text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Удалить интеграцию?")) {
                          const { deleteCase } = await import("@/actions/admin");
                          await deleteCase(item.id);
                          window.location.reload();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white p-1.5 md:p-2 rounded-full shadow text-xs"
                    >
                      Del
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

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
