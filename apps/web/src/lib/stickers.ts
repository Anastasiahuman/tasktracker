// Список допустимых стикеров смешариков с прозрачным фоном
// Используйте только файлы, которые имеют прозрачный фон (PNG/WebP)

export const STICKER_NAMES = [
  "Крош 1.png",
  "Крош 2.png",
  "Крош 3.png",
  "Крош 4.png",
  "Ежик 1.png",
  "Ежик 2.png",
  "Ежик 3.png",
  "Ежик 4.png",
  "Бараш 1.png",
  "Бараш 2.png",
  "Бараш 3.png",
  "Бараш 4.png",
  "Копатыч 1.png",
  "Копатыч 2.png",
  "Копатыч 3.png",
  "Копатыч 4.png",
  "Карыч 1.png",
  "Карыч 2.png",
  "Карыч 3.png",
  "Карыч 4.png",
] as const;

export function getRandomSticker(): string {
  const randomIndex = Math.floor(Math.random() * STICKER_NAMES.length);
  return `/images/${STICKER_NAMES[randomIndex]}`;
}

export function getStickerForIndex(index: number): string {
  const stickerIndex = index % STICKER_NAMES.length;
  return `/images/${STICKER_NAMES[stickerIndex]}`;
}

