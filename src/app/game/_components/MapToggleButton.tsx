"use client";

import { fredoka } from "@/utils/fonts";

interface MapToggleButtonProps {
  showMap: boolean;
  onClick: () => void;
}

const MapToggleButton: React.FC<MapToggleButtonProps> = ({
  showMap,
  onClick,
}) => {
  return (
    <div
      className={`absolute top-4 left-4 flex flex-col gap-4 z-50 cursor-pointer ${fredoka.className}`}
    >
      <button
        onClick={onClick}
        className="px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 border rounded-2xl bg-black/40 backdrop-blur-md border-white/20 hover:scale-105"
      >
        {showMap ? "Hide Map" : "Show Map"}
      </button>
    </div>
  );
};

export default MapToggleButton;
