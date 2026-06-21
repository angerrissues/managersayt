import { FaInstagram, FaTelegram, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 relative z-20 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
        
        {/* Левая колонка - Контакты */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          <div className="text-3xl font-black uppercase tracking-tighter">
            82 <span className="text-red-500">AGENCY</span>
          </div>
          <p className="text-white/50 text-sm">
            Премиальное агентство по работе с медиа-личностями. Стираем границы и выводим инфлюенс-маркетинг на международный уровень.
          </p>
          
          <div className="flex flex-col gap-4 mt-2">
            <a href="tel:+79199687396" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <FaPhoneAlt className="text-white/60 group-hover:text-white" />
              </div>
              <span className="font-mono text-lg">+7 (919) 968-73-96</span>
            </a>
            
            <a href="mailto:hello@82agency.com" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <FaEnvelope className="text-white/60 group-hover:text-white" />
              </div>
              <span className="font-mono text-lg">hello@82agency.com</span>
            </a>
          </div>
        </div>

        {/* Правая колонка - Соцсети (кнопки) */}
        <div className="w-full md:w-auto">
          <h3 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white/10 pb-4">Мы в соцсетях</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/82_agency?igsh=Nm16eG1remF4d3Z5" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center p-4 bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F56040]/10 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4 text-white">
                <FaInstagram size={28} className="text-[#E1306C] group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg uppercase tracking-wide">Instagram</span>
                  <span className="text-xs text-white/50">@82_agency</span>
                </div>
              </div>
            </a>

            {/* Telegram Channel */}
            <a 
              href="https://t.me/agency_82" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center p-4 bg-gradient-to-br from-[#0088cc]/10 to-[#00aaff]/10 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4 text-white">
                <FaTelegram size={28} className="text-[#0088cc] group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg uppercase tracking-wide">Telegram</span>
                  <span className="text-xs text-white/50">Наш канал</span>
                </div>
              </div>
            </a>

            {/* Telegram Manager */}
            <a 
              href="https://t.me/manager_hanguki" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center p-4 bg-gradient-to-br from-[#0088cc]/5 to-[#00aaff]/5 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:-translate-y-1 sm:col-span-2 group"
            >
              <div className="flex items-center gap-4 text-white">
                <FaTelegram size={28} className="text-white/60 group-hover:text-white transition-colors" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg uppercase tracking-wide">Связь с менеджером</span>
                  <span className="text-xs text-white/50">@manager_hanguki</span>
                </div>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* Копирайт */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/30 text-sm font-light text-center md:text-left">
          Все права защищены © 82 agency 2026
        </p>
        <p className="text-white/20 text-xs text-center md:text-right hover:text-white/40 transition-colors cursor-pointer">
          Политика конфиденциальности
        </p>
      </div>
    </footer>
  );
}
