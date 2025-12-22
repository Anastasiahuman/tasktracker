"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/workspace/new")}
              className="btn-primary flex items-center gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Workspace
            </button>
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

