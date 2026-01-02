"use client";

import { fredoka } from "@/utils/fonts";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GameModeOptionProps {
  mode: string;
  description: string;
  onClick?: () => void;
  image: {
    src: StaticImport | string;
    alt: string;
  };
}

export default function GameModeOption({
  mode,
  description,
  onClick,
  image,
}: GameModeOptionProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
    ${fredoka.className}
    relative flex flex-col justify-end gap-4
    w-full   p-8 grow h-full  
    rounded-3xl overflow-hidden select-none cursor-pointer
   backdrop-blur-md shadow-lg bg-black/30
    transition-all duration-300 border border-white/20
  `}
    >
      {/* Dark overlay */}
      <span className="absolute inset-0 cursor-pointer rounded-3xl bg-black/40" />

      {/* Highlight overlay */}
      {/* <span className="absolute inset-0 transition-opacity duration-300 rounded-3xl bg-gradient-to-r from-white/30 to-white/5 opacity-30" /> */}

      {/* Main content */}
      <div className="relative z-10 flex flex-col cursor-pointer">
        {/* Centered image */}
        <div className="flex justify-center -mt-2 ">
          <Image
            className="w-48 md:"
            alt={image.alt}
            width={170}
            height={170}
            src={image.src}
          />
        </div>

        {/* Left-aligned text */}
        <div className="flex flex-col items-start text-left">
          <h2 className="text-3xl font-bold text-white">{mode}</h2>
          <p className="text-white/70">{description}</p>
        </div>
      </div>
    </div>
  );
}
