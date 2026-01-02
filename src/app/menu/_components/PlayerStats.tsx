"use client";

import AvatarImage from "@/components/Avatar";
import { fredoka } from "@/utils/fonts";
import { ArrowBigUpDash, Gem, GemIcon, Medal, Percent } from "lucide-react";

interface PlayerBannerProps {
  username: string;
  score: number;
  accuracy: number; // 0-100
  hints?: string[]; // Array of tips/hints
  avatarUrl?: string;
}

export default function PlayerBanner({
  username,
  score,
  accuracy,
  hints = [],
}: PlayerBannerProps) {
  return (
    <div className="relative flex flex-col items-start w-full gap-4 p-6 mt-8 border shadow-lg md:flex-row md:items-center rounded-3xl bg-black/30 backdrop-blur-md border-white/20">
      {/* Left: Avatar */}
      {username && <AvatarImage seed={username} />}

      {/* Middle: Stats */}
      <div className="flex flex-col flex-1 w-full gap-1">
        <span
          className={`text-white font-semibold text-lg ${fredoka.className}`}
        >
          @{username}
        </span>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span className="flex items-center gap-1 ">Score: {score}</span>
        </div>
      </div>
    </div>
  );
}
