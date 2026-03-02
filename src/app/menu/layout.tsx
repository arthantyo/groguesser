"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    // Check if user is authenticated, if not redirect to auth page
    if (!profile?.id) {
      router.replace("/auth");
    }
  }, [profile?.id, router]);

  // Don't render children until we verify authentication
  if (!profile?.id) {
    return (
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
    );
  }

  return <>{children}</>;
}
