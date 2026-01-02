"use client";

import { useEffect, useState } from "react";
import AvatarImage from "@/components/Avatar";
import { fredoka } from "@/utils/fonts";
import { motion } from "framer-motion";

interface Player {
  id: string | number;
  name: string;
  score: number;
  rank?: number;
}

interface LeaderboardProps {
  limit?: number;
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/leaderboard?limit=${limit}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch leaderboard");
          return;
        }

        setPlayers(data.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit]);

  return (
    <div className="relative w-full p-6 h-full border shadow-lg rounded-3xl bg-black/40 backdrop-blur-md border-white/20">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`text-2xl ${fredoka.className} font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400`}
      >
        Leaderboard
      </motion.h2>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg
            className="w-8 h-8 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-4 text-center text-red-400">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && players.length === 0 && (
        <div className="py-4 text-center text-white/60">No players found</div>
      )}

      {/* List */}
      {!loading && !error && players.length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border border-white/10 ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-400/30 to-yellow-200/10 border-yellow-400/40"
                  : index === 1
                  ? "bg-gradient-to-r from-gray-300/20 to-white/10 border-gray-200/40"
                  : index === 2
                  ? "bg-gradient-to-r from-amber-600/30 to-orange-400/10 border-amber-400/40"
                  : "bg-black/30"
              }`}
            >
              {/* Left: rank + avatar + name */}
              <div className="flex items-center gap-3">
                <span className="w-6 text-lg font-bold text-center text-white">
                  {player.rank || index + 1}
                </span>
                {player.name ? (
                  <AvatarImage seed={player.name} />
                ) : (
                  <div className="w-8 h-8 border rounded-full bg-white/20 border-white/30" />
                )}
                <span className="font-medium text-white">{player.name}</span>
              </div>

              {/* Right: score */}
              <span className="font-semibold text-white">{player.score}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
