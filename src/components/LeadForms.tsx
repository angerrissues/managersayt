"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitAdvertiserLead, submitBloggerLead } from "@/actions/leads";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { IMaskInput } from "react-imask";

type Tab = "advertiser" | "blogger";

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function LeadForms() {
  const [activeTab, setActiveTab] = useState<Tab>("advertiser");
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("form") === "blogger") {
        setActiveTab("blogger");
      }
    }
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const action = activeTab === "advertiser" ? submitAdvertiserLead : submitBloggerLead;
      const result = await action(formData);

      if (result.success) {
        showToast(result.message, "success");
        formRef.current?.reset();
      } else {
        showToast(result.message, "error");
      }
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\s+/g, "").replace(/[А-Яа-яЁё]/g, "");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "advertiser", label: "Рекламодателям" },
    { key: "blogger", label: "Блогерам" },
  ];

  return (
    <section id="lead-forms" className="min-h-screen flex items-center justify-center px-4 md:px-6 py-20 md:py-32 relative z-20 bg-black overflow-hidden">
      
      {/* Decorative Background Words */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="relative w-full max-w-[1400px] mx-auto h-full">
          {[
            { word: "성공", css: "top-[15%] left-[5%] md:left-[10%] -rotate-12 text-5xl md:text-6xl" },
            { word: "유행", css: "top-[65%] left-[2%] md:left-[12%] rotate-6 text-4xl md:text-5xl" },
            { word: "매체", css: "top-[25%] right-[5%] md:right-[12%] rotate-12 text-5xl md:text-6xl" },
            { word: "성장", css: "bottom-[15%] right-[3%] md:right-[15%] -rotate-6 text-4xl md:text-5xl" },
            { word: "영향", css: "top-[45%] right-[2%] md:right-[5%] rotate-[30deg] text-4xl md:text-6xl hidden md:block" },
          ].map((item, i) => (
            <span
              key={i}
              className={`absolute font-bold text-white/10 transition-all duration-300 hover:font-black hover:text-white/50 hover:scale-110 pointer-events-auto cursor-default select-none ${item.css}`}
            >
              {item.word}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-3 md:mb-4 text-white text-center"
        >
          Работать с нами
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/40 text-center mb-10 md:mb-16 text-sm md:text-lg"
        >
          Оставьте заявку — мы свяжемся в течение 24 часов
        </motion.p>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8 md:mb-12"
        >
          <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 md:p-1.5 backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 cursor-none ${activeTab === tab.key ? "text-black" : "text-white/60 hover:text-white"
                  }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              ref={formRef}
              action={handleSubmit}
              initial={{ opacity: 0, x: activeTab === "advertiser" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "advertiser" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 md:space-y-8 p-5 md:p-10 bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl backdrop-blur-sm relative z-20"
            >
              {/* Name */}
              <input
                type="text"
                name="name"
                required
                placeholder="Ваше имя"
                className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400"
              />

              {/* Nickname (only for Blogger) */}
              {activeTab === "blogger" && (
                <input
                  type="text"
                  name="nickname"
                  required
                  placeholder="Никнейм"
                  className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400"
                />
              )}

              {/* Email */}
              <input
                type="email"
                name="email"
                required
                onChange={handleEmailChange}
                placeholder="Email"
                className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400"
              />

              {/* Phone */}
              <IMaskInput
                mask="+{7} (000) 000-00-00"
                type="tel"
                name="phone"
                required
                placeholder="+7 (___) ___-__-__"
                className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400"
              />

              {/* Dynamic field */}
              {activeTab === "advertiser" ? (
                <>
                  <input
                    type="text"
                    name="brandName"
                    required
                    placeholder="Бренд"
                    className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400"
                  />
                  <textarea
                    name="requestText"
                    required
                    rows={3}
                    placeholder="С каким запросом вы пришли?"
                    className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400 resize-none"
                  />
                </>
              ) : (
                <textarea
                  name="socialLinks"
                  required
                  rows={3}
                  placeholder="Ссылки на соцсети"
                  className="w-full bg-white text-black text-base md:text-lg py-3.5 md:py-4 px-4 md:px-5 outline-none rounded-md placeholder:text-gray-400 resize-none"
                />
              )}

              {/* Checkbox */}
              <div className="flex items-start md:items-center gap-3 pt-1 md:pt-2">
                <input
                  type="checkbox"
                  id="agreement"
                  required
                  className="w-5 h-5 mt-0.5 md:mt-0 cursor-pointer accent-red-600 rounded-sm shrink-0"
                />
                <label htmlFor="agreement" className="text-xs md:text-sm text-white/90 cursor-pointer select-none font-medium leading-snug">
                  я соглашаюсь на обработку своих персональных данных
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 md:py-4 mt-1 md:mt-2 bg-red-600 text-white font-medium text-base md:text-lg rounded-md hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "отправить заявку"
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-4 md:bottom-8 left-1/2 z-[200] flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 rounded-full border backdrop-blur-xl shadow-2xl text-xs md:text-sm ${toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
