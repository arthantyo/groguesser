"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { fredoka } from "@/utils/fonts";
import ConfirmModal from "./ConfirmModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialUsername = "Player1",
}: SettingsModalProps) {
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState(initialUsername);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [usernameError, setUsernameError] = useState("");

  const resetDisabled = false;
  const daysLeft = 30;

  const [confirmAction, setConfirmAction] = useState<null | "reset" | "delete">(
    null
  );

  const handleConfirm = () => {
    if (confirmAction === "reset") {
      alert("Progress reset!");
    } else if (confirmAction === "delete") {
      alert("Account deleted!");
    }
    setConfirmAction(null);
  };

  const handleResetProgress = () => {
    alert("Progress reset!");
  };

  const handleDeleteAccount = () => {
    alert("Account deleted!");
  };

  const validateUsername = (value: string) => {
    if (!value) return "Username cannot be empty";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.includes(" ")) return "Username cannot have spaces";
    // Example: check if username exists (mock)
    const existingUsers = ["Player1", "Admin", "TestUser"];
    if (existingUsers.includes(value)) return "Username already exists";
    return "";
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`flex flex-col gap-6 p-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl w-full max-w-4xl text-white shadow-lg ${fredoka.className}`}
            >
              <h2 className="text-2xl font-bold text-white">Settings</h2>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-white/70">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsername(val);
                    const error = validateUsername(val);
                    setUsernameError(error);
                  }}
                  className={`px-3 py-2 text-white border rounded-xl bg-black/30 focus:outline-none focus:ring-2 ${
                    usernameError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-green-500"
                  }`}
                />
                {usernameError && (
                  <p className="text-xs text-red-500">{usernameError}</p>
                )}
              </div>

              {/* Sound & Music */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-white/90">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled((prev) => !prev)}
                    className="accent-green-500"
                  />
                  Sound Effects
                </label>
                <label className="flex items-center gap-2 text-white/90">
                  <input
                    type="checkbox"
                    checked={musicEnabled}
                    onChange={() => setMusicEnabled((prev) => !prev)}
                    className="accent-green-500"
                  />
                  Music
                </label>
              </div>

              {/* Reset & Delete */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Danger zone!</label>
                <button
                  onClick={() => setConfirmAction("reset")}
                  disabled={resetDisabled}
                  className={`px-4 py-2 rounded-2xl font-semibold text-xs transition ${
                    resetDisabled
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {resetDisabled
                    ? `Reset Progress (${daysLeft} days left)`
                    : "Reset Progress"}
                </button>
                <button
                  onClick={() => setConfirmAction("delete")}
                  className="px-4 py-2 text-xs font-semibold transition bg-red-600 rounded-2xl hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 transition bg-gray-700 rounded-2xl hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setSaving(true);
                    // simulate save request
                    await new Promise((res) => setTimeout(res, 1000));
                    setSaving(false);
                    onClose();
                  }}
                  disabled={saving}
                  className="px-4 py-2 font-semibold transition bg-green-700 rounded-2xl hover:bg-green-800"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction === "reset" ? "Reset Progress" : "Delete Account"}
        message={
          confirmAction === "reset"
            ? "Are you sure you want to reset your progress? You can only do this once per month."
            : "Are you sure you want to delete your account? This action cannot be undone."
        }
        confirmText={confirmAction === "reset" ? "Yes, Reset" : "Yes, Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
