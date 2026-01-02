"use client";
import MenuCard from "./_components/MenuCard";
import Navbar from "./_components/Navbar";
import PlayerBanner from "./_components/PlayerStats";
import Leaderboard from "./_components/Leaderboard";
import { useEffect, useState } from "react";
import { Background } from "@/components/Background";
import { generateAvatar } from "@/utils/pfp";
import { useAuthStoreMethods, useAuthStoreProfile } from "../../store/auth";

export default function MenuPage() {
  const profile = useAuthStoreProfile();
  const { getProfile } = useAuthStoreMethods();

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!profile) {
        getProfile();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/player/${profile.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch profile");
          return;
        }

        setPlayer(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [profile?.id]);

  const avatarUrl = player
    ? generateAvatar({ seed: player.username, size: 128 })
    : "";
  return (
    <div className="relative min-h-screen px-8 pb-5 overflow-hidden bg-gray-900">
      <Background />

      <div className={`transition-opacity duration-300 opacity-100`}>
        {player && (
          <>
            <Navbar username={player.username} avatarUrl={avatarUrl} />
            <PlayerBanner
              username={player.username}
              score={player.score}
              accuracy={player.solvedLandmarks}
              avatarUrl={avatarUrl}
              hints={[
                "Try exploring the Zernike campus",
                "High accuracy gives extra points",
              ]}
            />
            <div className="grid grid-cols-1 gap-8 mt-2  h-full">
              <div>
                <MenuCard />
              </div>
              <div>
                <Leaderboard limit={5} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      /> */}

      {/* Full-page loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <svg
            className="w-16 h-16 text-white animate-spin"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-red-500 bg-black/50">
          {error}
        </div>
      )}
    </div>
  );
}
