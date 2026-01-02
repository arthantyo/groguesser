"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fredoka } from "@/utils/fonts";
import { X, MapPin, Heart, Clock } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const rules = [
    {
      icon: <MapPin className="inline w-5 h-5 mr-2 text-green-400" />,
      text: "Explore the campus and find the hidden locations.",
    },
    {
      icon: <Clock className="inline w-5 h-5 mr-2 text-yellow-400" />,
      text: "Place your guess on the map before time runs out.",
    },
    {
      icon: <MapPin className="inline w-5 h-5 mr-2 text-blue-400" />,
      text: "Distance from the target determines your score.",
    },
    {
      icon: <Heart className="inline w-5 h-5 mr-2 text-red-400" />,
      text: "You have a limited number of hearts (lives).",
    },
    {
      icon: <Clock className="inline w-5 h-5 mr-2 text-pink-400" />,
      text: "If time runs out, you lose a heart.",
    },
    {
      icon: <MapPin className="inline w-5 h-5 mr-2 text-purple-400" />,
      text: "Correct guesses fill your round panel green; wrong ones fill red.",
    },
    {
      icon: <Heart className="inline w-5 h-5 mr-2 text-cyan-400" />,
      text: "Pass rate is calculated by correct guesses divided by total rounds.",
    },
    {
      icon: <MapPin className="inline w-5 h-5 mr-2 text-orange-400" />,
      text: "Have fun and challenge yourself!",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative flex flex-col w-full max-w-3xl p-6 bg-black/30 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl overflow-y-auto ${fredoka.className}`}
          >
            {/* Top-right close button */}
            <button
              onClick={onClose}
              className="absolute p-2 text-white transition-transform rounded-full shadow-md top-4 right-4 hover:bg-red-600 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="mb-6 text-3xl font-bold tracking-wide text-center text-white">
              Game Rules
            </h2>

            <ul className="flex flex-col gap-4 px-2 text-left text-white list-none">
              {rules.map((rule, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm leading-relaxed md:text-base"
                >
                  {rule.icon} {rule.text}
                </li>
              ))}
            </ul>

            {/* Bottom Close Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-green-700 shadow-lg rounded-2xl hover:bg-green-800 hover:scale-105 active:scale-95"
              >
                <MapPin className="w-4 h-4 text-white" />
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
