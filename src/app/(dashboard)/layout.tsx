"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredState } from "@/lib/store";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { AIAssistantWidget } from "@/components/ai-assistant-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const state = getStoredState();
    if (!state.isInitialized || !state.companySettings) {
      router.replace("/setup");
    } else if (!state.currentUser) {
      router.replace("/login");
    } else if (state.currentUser.must_change_password) {
      router.replace("/change-password");
    } else {
      setCurrentUser(state.currentUser);
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === "AbortError" ||
        String(event.reason?.message).includes("play()") ||
        String(event.reason?.message).includes("interrupted")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleRejection);

    const handleState = () => {
      const s = getStoredState();
      setCurrentUser(s.currentUser);
    };
    window.addEventListener("hcm_state_changed", handleState);
    return () => {
      window.removeEventListener("hcm_state_changed", handleState);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [router]);

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafbfc] dark:bg-slate-950">
      {/* Sidebar with mobile drawer support */}
      <Sidebar
        role={currentUser.role}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </main>
      </div>

      {/* Persistent AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
}
