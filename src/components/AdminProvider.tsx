"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { checkIsAdmin, loginAdmin, logoutAdmin } from "@/actions/admin";

interface AdminContextType {
  isAdmin: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false, logout: () => {} });

export const useAdmin = () => useContext(AdminContext);

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check initially
    checkIsAdmin().then(setIsAdmin);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === "KeyY") {
        setShowModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = async () => {
    setError("");
    const res = await loginAdmin(password);
    if (res.success) {
      setIsAdmin(true);
      setShowModal(false);
      setPassword("");
    } else {
      setError(res.error || "Ошибка");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, logout: handleLogout }}>
      {children}
      
      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Админ-Панель</h2>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 pr-10 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              Войти
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full text-white/50 hover:text-white text-sm transition-colors mt-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-[9998] bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-4 text-sm">
          Админ режим
          <button onClick={handleLogout} className="text-white/70 hover:text-white underline">Выйти</button>
        </div>
      )}
    </AdminContext.Provider>
  );
}
