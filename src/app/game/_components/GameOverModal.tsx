"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { fredoka } from "@/utils/fonts";
import { useRouter } from "next/navigation";
import { GameRound, getDistanceMeters } from "../../../utils/game"; // Make sure this util is available
import { useGameStore } from "../../../store/game";

const MAX_DISTANCE = 20000; // meters → 20 km (you can tweak)

interface GameOverModalProps {
  roundResults: GameRound[];
}

const GameOverModal: React.FC<GameOverModalProps> = ({ roundResults }) => {
  const router = useRouter();
  const endGameSession = useGameStore((state) => state.methods.endSession);

  // Compute stats
  const stats = useMemo(() => {
    const solvedRounds = roundResults.filter((r) => r.roundWon);
    const totalRounds = roundResults.length;

    const totalScore = roundResults.reduce((sum, r) => sum + (r.score || 0), 0);

    // Compute average accuracy from distances
    const avgAccuracy =
      roundResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalRounds;

    const passRate = (solvedRounds.length / totalRounds) * 100;

    const totalTime = roundResults.reduce((sum, r) => {
      if (r.startedAt && r.endedAt) {
        const start = new Date(r.startedAt).getTime();
        const end = new Date(r.endedAt).getTime();
        return sum + Math.max(0, end - start);
      }
      return sum;
    }, 0);

    const fastestRound = roundResults.reduce((fastest, r) => {
      if (r.startedAt && r.endedAt) {
        const time =
          new Date(r.endedAt).getTime() - new Date(r.startedAt).getTime();
        if (fastest === null || time < fastest) return time;
      }
      return fastest;
    }, null as number | null);

    return {
      solvedRounds: solvedRounds.length,
      totalRounds,
      totalScore,
      avgAccuracy,
      passRate,
      totalTimeMs: totalTime,
      fastestRoundMs: fastestRound,
    };
  }, [roundResults]);

  const formatTime = (ms: number | null) => {
    if (!ms) return "–";
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`flex flex-col items-center w-[22rem] p-8 bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-3xl shadow-xl space-y-4 ${fredoka.className}`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Game Over!
        </h2>

        <div className="w-full mt-2 space-y-2 text-center">
          <div className="flex justify-between text-sm text-white/70">
            <span>Average Accuracy:</span>
            <span className="font-semibold text-yellow-400">
              {stats.avgAccuracy.toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between text-sm text-white/70">
            <span>Total Score:</span>
            <span className="font-semibold text-purple-400">
              {stats.totalScore.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm text-white/70">
            <span>Total Playtime:</span>
            <span className="font-semibold text-white">
              {formatTime(stats.totalTimeMs)}
            </span>
          </div>
        </div>

        <motion.div
          className="mt-4 mb-6 text-lg font-bold text-center text-green-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Final Score</p>
          <p className="text-3xl text-yellow-300 drop-shadow-md">
            {stats.totalScore.toLocaleString()}
          </p>
        </motion.div>

        <button
          className={`px-6 py-2 rounded-3xl cursor-pointer text-xs
           bg-green-700 text-white font-medium
           shadow-md hover:bg-green-800
           hover:shadow-lg hover:scale-105
           active:scale-95 transition-all duration-300 ease-out`}
          onClick={() => {
            endGameSession();
            router.push("/menu");
          }}
        >
          Return to Menu
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GameOverModal;
