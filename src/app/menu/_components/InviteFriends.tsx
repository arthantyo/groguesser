"use client";
import React, { memo, useCallback } from "react";
import { fredoka } from "../../../utils/fonts";
import { useToast } from "../../../providers/Toast";

interface InviteFriendsProps {
  inviteLink: string;
  onCopied?: () => void;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ inviteLink }) => {
  const { showToast } = useToast();
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(inviteLink);
    showToast("Copied to clipboard!", "info");
  }, [inviteLink]);

  return (
    <div
      className={`flex flex-col gap-3 p-6 border bg-black/30 rounded-3xl border-white/20 shadow-md backdrop-blur-sm ${fredoka.className}`}
    >
      <h3 className="text-xl font-bold text-white">Invite Friends</h3>
      <p className="text-sm text-white/70">Share this app and compete!</p>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          readOnly
          value={inviteLink}
          className="flex-1 px-3 py-2 text-white border bg-black/40 border-white/20 rounded-xl focus:outline-none"
        />
        <button
          className="px-4 py-2 text-sm font-semibold text-white transition-all bg-yellow-600 rounded-xl hover:bg-yellow-700 hover:scale-105 active:scale-95"
          onClick={handleCopy}
        >
          Copy
        </button>
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders if props don’t change
export default memo(InviteFriends);
