"use client";

import { useRouter } from "next/navigation";

interface PlayButtonProps {
  label: string;
  gradient: string;
  route: string;
}

export default function PlayButton({
  label,
  gradient,
  route,
}: PlayButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className={`relative inline-flex items-center justify-center px-10 py-4 rounded-2xl text-lg font-bold text-white ${gradient} shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 hover:opacity-30 transition-opacity duration-300 rounded-2xl" />
      <span className="relative z-10">{label}</span>
    </button>
  );
}
