import { useEffect, useState } from "react";
import {
  calculateDistanceScore,
  GameLocation,
  getDistanceMeters,
} from "../../../utils/game";

export default function ScoreDisplay({
  score,
  distanceFromTarget,
  accuracy,
}: {
  score: number;
  distanceFromTarget: number;
  accuracy: number;
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    setDistance(distanceFromTarget);

    let current = 0;
    const increment = Math.max(1, Math.floor(score / 50)); // adjust speed
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 15); // adjust interval speed

    return () => clearInterval(interval);
  }, [distance]);

  if (distance === null) return null;

  return (
    <div className="absolute z-10 px-4 py-2 text-center text-white transform -translate-x-1/2 shadow-lg bottom-24 left-1/2 bg-black/70 rounded-xl">
      <p>You were {distance.toFixed(1)} meters from the target!</p>
      <div className="flex justify-center gap-2 text-center">
        <p>Score: {displayScore.toFixed(1)}</p>{" "}
        {accuracy !== null && (
          <p className="font-medium">Accuracy: {accuracy.toFixed(1)}%</p>
        )}
      </div>
    </div>
  );
}
