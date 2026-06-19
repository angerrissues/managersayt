"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference text-white">
      <Link href="/" className="text-3xl font-bold tracking-tighter uppercase">
        82 Agency
      </Link>
      
      <div className="flex gap-10 font-medium text-sm tracking-wide uppercase">
        {["Главная", "Кейсы", "Медиа-личности"].map((item, index) => {
          const href = index === 0 ? "/" : index === 1 ? "/cases" : "/blogers";
          const isActive = pathname === href;
          return (
            <Link key={index} href={href} className={`relative group overflow-hidden ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100 transition-opacity'}`}>
              <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">{item}</span>
              <span className="block absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover:translate-y-0">{item}</span>
              {isActive && (
                <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-white transform origin-left" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
