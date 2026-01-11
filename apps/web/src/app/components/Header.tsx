"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <header className="bg-white soft-shadow-lg sticky top-0 z-50 border-b-4 border-pastel-blue">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-pastel-blue p-1">
                <Image
                  src="/images/Крош 1.png"
                  alt="Крош"
                  width={60}
                  height={60}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-pastel-pink p-1">
                <Image
                  src="/images/Ежик 1.png"
                  alt="Ежик"
                  width={60}
                  height={60}
                  className="rounded-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-blue via-accent-pink to-accent-yellow bg-clip-text text-transparent">
              Task Tracker
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-pastel-pink hover:bg-accent-pink text-pink-800 font-semibold transition-colors"
              >
                Выйти
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-pastel-blue hover:bg-accent-blue text-blue-800 font-semibold transition-colors"
              >
                Войти
              </Link>
            )}
            <div className="flex items-center gap-2">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-pastel-purple p-1">
                <Image
                  src="/images/Бараш 1.png"
                  alt="Бараш"
                  width={50}
                  height={50}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-pastel-orange p-1">
                <Image
                  src="/images/Копатыч 1.png"
                  alt="Копатыч"
                  width={50}
                  height={50}
                  className="rounded-full object-contain"
                />
              </div>
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-pastel-yellow p-1">
                <Image
                  src="/images/Карыч 1.png"
                  alt="Карыч"
                  width={50}
                  height={50}
                  className="rounded-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

