"use client";

import { fredoka } from "@/utils/fonts";

interface RoundPanelProps {
  currentRound: number;
  roundResults: ("correct" | "wrong" | null)[];
  score?: number; // optional, defaults to 80%
}

const RoundPanel: React.FC<RoundPanelProps> = ({
  currentRound,
  roundResults,
  score = 0,
}) => {
  return (
    <div
      className={`absolute top-4 right-4 z-10 w-full flex flex-col gap-3 select-none items-end ${fredoka.className}`}
    >
      {/* Round & Pass Rate Box */}
      <div className="px-4 py-3 rounded-2xl w-full max-w-[14em] bg-black/40 backdrop-blur-md border border-white/20 text-white font-semibold flex flex-col">
        <div className="flex flex-col">
          <span className="text-lg text-left">Round {currentRound}</span>
          <span className="text-xs text-left text-white/70">
            Score: {score}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          {roundResults.map((res, idx) => {
            let bgClass = "bg-transparent";

            if (res === "correct") bgClass = "bg-green-500";
            else if (res === "wrong") bgClass = "bg-red-500";
            else if (idx + 1 === currentRound)
              bgClass = "bg-gray-300"; // highlight current round
            else if (idx + 1 < currentRound) bgClass = "bg-gray-300"; // past rounds w/o result

            return (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full border border-white ${bgClass}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoundPanel;
