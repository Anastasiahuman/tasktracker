"use client";

import Image from "next/image";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export default function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        {/* Облачко SVG */}
        <svg
          width="200"
          height="150"
          viewBox="0 0 200 150"
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
        >
          <path
            d="M50 80 Q30 60 50 50 Q60 30 80 40 Q100 20 120 40 Q130 30 140 50 Q160 50 150 70 Q170 80 160 100 Q140 110 120 100 Q100 120 80 110 Q60 120 50 100 Q30 100 40 80 Z"
            fill="rgba(184, 224, 240, 0.3)"
            stroke="rgba(126, 200, 227, 0.5)"
            strokeWidth="2"
          />
        </svg>
        
        {/* Стикер смешарика */}
        <div className="relative z-10 mt-8">
          <Image
            src="/images/Бараш 1.png"
            alt="Бараш"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">
        Задач пока нет
      </h3>
      <p className="text-foreground/70 mb-6 text-center max-w-md">
        Попробуйте изменить фильтры или создать новую задачу
      </p>
      
      <button
        onClick={onResetFilters}
        className="btn-primary"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}

