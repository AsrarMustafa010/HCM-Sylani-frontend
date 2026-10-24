"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredState } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const state = getStoredState();
    if (!state.isInitialized || !state.companySettings) {
      router.replace("/setup");
    } else if (!state.currentUser) {
      router.replace("/login");
    } else if (state.currentUser.must_change_password) {
      router.replace("/change-password");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading HCM Lite...</p>
      </div>
    </div>
  );
}
