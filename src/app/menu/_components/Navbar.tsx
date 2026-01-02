"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fredoka } from "@/utils/fonts";
import AvatarImage from "@/components/Avatar";
import { logoutUser } from "../../actions/auth";
import { useAuthStoreMethods } from "../../../store/auth";

interface NavbarProps {
  username: string;
  avatarUrl: string;
}

export default function Navbar({ username }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStoreMethods();

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-4 border shadow-md bg-black/40 backdrop-blur-md rounded-b-3xl border-white/20">
      <button
        onClick={() => router.push("/")}
        className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400  ${fredoka.className}`}
      >
        GroGuesser
      </button>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 transition-shadow duration-300 rounded-2xl hover:shadow-lg"
        >
          <AvatarImage seed={username} />
          <span className="font-semibold text-white">{username}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-20 w-40 mt-2 overflow-hidden bg-black border shadow-lg backdrop-blur-md rounded-xl border-white/20">
            {/* <button
              onClick={onClickSettings}
              className="w-full px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
            >
              Settings
            </button> */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
