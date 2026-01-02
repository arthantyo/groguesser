import { fredoka } from "@/utils/fonts";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeartsProps {
  total: number;
  remaining: number;
}

const HeartsDisplay: React.FC<HeartsProps> = ({ total, remaining }) => {
  return (
    <div
      className={`absolute bottom-8 left-10 z-10 flex flex-col gap-3 select-none items-start ${fredoka.className}`}
    >
      <div className="flex flex-col w-full max-w-sm px-4 py-3 font-semibold text-white border rounded-2xl bg-black/40 backdrop-blur-md border-white/20">
        <div className="flex gap-2">
          <AnimatePresence>
            {Array.from({ length: total }).map((_, idx) => {
              const isActive = idx < remaining;

              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isActive
                        ? "fill-white text-white drop-shadow-[0_0_1px_white] "
                        : " text-gray-200"
                    }`}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HeartsDisplay;
