"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredState, syncFromBackend } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    syncFromBackend().then((state) => {
      if (!active) return;
      if (!state.isInitialized || !state.companySettings) {
        router.replace("/setup");
      } else if (!state.currentUser) {
        router.replace("/login");
      } else if (state.currentUser.must_change_password) {
        router.replace("/change-password");
      } else {
        router.replace("/dashboard");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent dark:border-white" />
        <p className="text-sm font-medium text-slate-500">Loading HCM Lite...</p>
      </div>
    </div>
  );
}
