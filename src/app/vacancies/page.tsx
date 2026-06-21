"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import LeadForms from "@/components/LeadForms";

const advantages = [
  {
    title: "Эксклюзивный ростер",
    description: "Мы работаем только с топ-1% рынка. Наш клуб медиа-личностей закрыт для случайных людей."
  },
  {
    title: "Data-Driven подход",
    description: "Наши решения основаны на точной аналитике и прогнозировании результатов, а не на слепой интуиции."
  },
  {
    title: "Фокус на конверсиях",
    description: "Мы не продаем пустые охваты. Наша главная цель — реальные продажи, рост лояльности и окупаемость инвестиций."
  },
  {
    title: "Полный цикл 360°",
    description: "Мы берем на себя всё: от разработки креативной стратегии до финального продакшена и детальной отчетности по кампании."
  }
];

export default function VacanciesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Отслеживаем скролл по всему контейнеру страницы
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Настраиваем отлёт по бокам
  const flyLeft = useTransform(scrollYProgress, [0.3, 0.9], ["0vw", "-100vw"]);
  const flyRight = useTransform(scrollYProgress, [0.3, 0.9], ["0vw", "100vw"]);
  const fadeOut = useTransform(scrollYProgress, [0.4, 0.8], [1, 0]);

  return (
    <main ref={containerRef} className="min-h-screen pt-40 bg-black text-white selection:bg-white selection:text-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-0">
        
        {/* Заголовок улетает влево */}
        <motion.div style={{ x: flyLeft, opacity: fadeOut }}>
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-16"
          >
            Вакансии
          </motion.h1>
        </motion.div>
        
        <div className="mb-20">
          {/* Подзаголовок улетает вправо */}
          <motion.div style={{ x: flyRight, opacity: fadeOut }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">Почему 82 Agency?</h2>
              <p className="text-white/50 text-xl max-w-2xl font-light">Мы ломаем стандарты рекламной индустрии и строим агентство нового типа. У нас лучшие условия на рынке для тех, кто готов создавать тренды вместе с нами.</p>
            </motion.div>
          </motion.div>
          
          {/* Карточки разлетаются в разные стороны */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {advantages.map((adv, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={index} 
                  style={{ x: isEven ? flyLeft : flyRight, opacity: fadeOut }}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full p-8 md:p-10 border border-white/10 bg-white/[0.02] rounded-3xl backdrop-blur-sm hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="text-white/20 font-black text-5xl mb-4 group-hover:text-white/40 transition-colors duration-500">
                      0{index + 1}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide">{adv.title}</h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg">{adv.description}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Мотивирующая фраза */}
        <div className="text-center mt-32 mb-10 overflow-hidden">
          <motion.div style={{ x: flyLeft, opacity: fadeOut }}>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight"
            >
              Меньше рутины. <br className="md:hidden" />Больше свободы.
            </motion.h2>
          </motion.div>
          
          <motion.div style={{ x: flyRight, opacity: fadeOut }}>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/50 font-light max-w-3xl mx-auto leading-relaxed"
            >
              Выбирая <span className="text-white font-medium">82 Agency</span>, вы выбираете абсолютный комфорт и масштаб. Оставьте операционку нам, а сами занимайтесь тем, что по-настоящему любите.
            </motion.p>
          </motion.div>
        </div>
      </div>
      
      {/* Форма заявки - остается на месте, выплывает снизу */}
      <div className="relative z-10 bg-black">
        <LeadForms />
      </div>
    </main>
  );
}
