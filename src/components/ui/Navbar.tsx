"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Кейсы", href: "/cases" },
  { label: "Медиа-личности", href: "/blogers" },
  { label: "Вакансии", href: "/vacancies" },
];

const menuOverlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 },
  },
};

const linkContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const linkItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Main navigation bar ── */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:p-6 flex items-center justify-between md:justify-start mix-blend-difference text-white">
        {/* Logo – smaller on mobile */}
        <Link
          href="/"
          className="text-xl md:text-3xl font-bold tracking-tighter uppercase relative z-[60]"
          onClick={closeMobile}
        >
          82 Agency
        </Link>

        {/* ── Desktop centered links (hidden on mobile) ── */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10 font-medium text-sm tracking-wide uppercase">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative group overflow-hidden ${
                  isActive
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100 transition-opacity"
                }`}
              >
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                  {label}
                </span>
                <span className="block absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover:translate-y-0">
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-white transform origin-left" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Hamburger button (mobile only) ── */}
        <button
          type="button"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="relative z-[60] md:hidden flex items-center justify-center w-10 h-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25 }}
              >
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.25 }}
              >
                <Menu className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* ── Full-screen mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            variants={menuOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[55] md:hidden bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <motion.ul
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center gap-8"
            >
              {NAV_ITEMS.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <motion.li key={href} variants={linkItemVariants}>
                    <Link
                      href={href}
                      onClick={closeMobile}
                      className={`text-3xl sm:text-4xl font-bold uppercase tracking-wide transition-opacity ${
                        isActive ? "text-white opacity-100" : "text-white/70 hover:text-white hover:opacity-100"
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="block mx-auto mt-2 w-8 h-[2px] bg-white rounded-full" />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
