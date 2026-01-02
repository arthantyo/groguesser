"use client";
import { fredoka } from "@/utils/fonts";
import FeatureIcons from "@/components/FeatureIcons";
import Button from "@/components/Button";
import { Background } from "@/components/Background";
import Link from "next/link";
import RulesModal from "@/components/RulesModal";
import { useState } from "react";

const Hero = () => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center min-h-screen overflow-hidden ${fredoka.className}`}
    >
      <Background />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl px-6 mx-auto text-center">
        {/* Announcement Banner */}
        <div className="flex items-center gap-2 px-4 py-2 mb-4 text-xs font-semibold text-white border shadow-md bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-400/20 backdrop-blur-md border-white/20 rounded-2xl">
          🎉 We just launched! Try GroGuesser now!
        </div>

        <div className="mb-8">
          <h1
            className={`text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 ${fredoka.className}`}
          >
            GroGuesser
          </h1>

          <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-100 md:text-2xl">
            Discover every corner of University of Gronigen!
          </p>
        </div>
        {/* Feature Icons */}
        <FeatureIcons />

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={"/menu"} passHref>
            <Button>Start Playing</Button>
          </Link>
          <Button onClick={() => setIsRulesOpen(true)} variant="glass">
            How to play
          </Button>
        </div>
      </div>
      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};

export default Hero;
