import Image from "next/image";

interface StickerProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function Sticker({ src, alt, size = 60, className = "" }: StickerProps) {
  return (
    <div className={`inline-block ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="sticker-shadow"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

