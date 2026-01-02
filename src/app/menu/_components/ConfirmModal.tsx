"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fredoka } from "@/utils/fonts";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className={`flex flex-col gap-4 p-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl w-full max-w-md text-white shadow-lg ${fredoka.className}`}
          >
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-white/80">{message}</p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 transition bg-gray-700 rounded-2xl hover:bg-gray-800"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 font-semibold transition bg-red-600 rounded-2xl hover:bg-red-700"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
