"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MenuCardOption from "./GameModeOption";
import { useToast } from "@/providers/Toast";
import { useGameStore, useGameStoreMethods } from "../../../store/game";
import { PlayerStatus } from "../../../utils/game";
import GameModeOption from "./GameModeOption";
import { useAuthStoreMethods, useAuthStoreProfile } from "../../../store/auth";

export default function MenuCard() {
  const router = useRouter();
  const profile = useAuthStoreProfile();
  const { createSession } = useGameStoreMethods();
  const { getProfile } = useAuthStoreMethods();
  const { showToast } = useToast();

  // Load profile on mount if not available
  useEffect(() => {
    if (!profile) {
      getProfile();
    }
  }, [profile, getProfile]);

  const handleComingSoon = () => {
    showToast("Map viewer is coming soon!", "info");
  };

  const handleStartSolo = async () => {
    if (!profile) {
      showToast("Please wait, loading your profile...", "info");
      return;
    }

    try {
      await createSession({
        playerIds: [profile.playerId],
      });

      // Navigate to game after session is created
      router.push("/game");
    } catch (err) {
      console.error("Failed to start session:", err);
      showToast("Could not start game session.", "warning");
    }
  };

  return (
    <>
      <div className="relative z-10 flex flex-col h-full items-center w-full gap-4 mt-4 md:flex-row">
        <GameModeOption
          mode="Solo"
          description="Explore and guess campus locations!"
          onClick={handleStartSolo}
          image={{ alt: "compass", src: "/vibrant-compass.png" }}
        />
        <GameModeOption
          mode="Map"
          onClick={handleComingSoon}
          description="Look for places you have explored!"
          image={{ alt: "map", src: "/vibrant-map.png" }}
        />
      </div>
    </>
  );
}
