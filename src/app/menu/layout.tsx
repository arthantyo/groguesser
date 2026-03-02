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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
