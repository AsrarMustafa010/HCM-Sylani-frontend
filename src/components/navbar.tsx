"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  Building2,
  Shield,
  User as UserIcon,
  CheckCircle,
  RefreshCcw,
  Menu,
} from "lucide-react";
import { getStoredState, logoutUser, resetToEmptyState } from "@/lib/store";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { LogoIcon } from "@/components/logo";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [state, setState] = useState(getStoredState());
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleStateChange = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleStateChange);
    return () => window.removeEventListener("hcm_state_changed", handleStateChange);
  }, []);

  const currentUser = state.currentUser;
  const companyName = state.companySettings?.company_name || "HCM Lite";
  const unreadNotifications = state.notifications.filter((n) => !n.is_read);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleResetForDemo = () => {
    if (confirm("Reset everything to empty state for fresh judging demo?")) {
      resetToEmptyState();
      router.push("/setup");
    }
  };

  const roleBadgeVariants: Record<string, "default" | "success" | "secondary"> = {
    admin: "default",
    hr: "success",
    employee: "secondary",
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Mobile Hamburger */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="md:hidden h-9 w-9 text-slate-700 dark:text-slate-300 -ml-1 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <LogoIcon size={38} className="shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-[120px] sm:max-w-none">
                {companyName}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border border-slate-300 dark:border-slate-700">
                HCM Lite
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
              Saylani Hackathon 2026 Edition
            </p>
          </div>
        </div>

        {/* Right: Controls & User Info */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Demo Fresh Reset button for Judges */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetForDemo}
            title="Reset to blank install (Judges 5-min demo)"
            className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border-dashed"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden md:inline">Judge Demo Reset</span>
          </Button>

          {/* Theme Switcher */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-600 dark:text-slate-300"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500" />
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notifications
                  </h4>
                  <span className="text-[11px] text-slate-900 dark:text-slate-100 font-medium hover:underline cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                  {state.notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No notifications yet
                    </p>
                  ) : (
                    state.notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800/60 text-xs"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile & Role badge */}
          {currentUser ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[130px]">
                  {currentUser.employee_name || currentUser.email}
                </div>
                <Badge
                  variant={roleBadgeVariants[currentUser.role] || "default"}
                  className="uppercase text-[10px] tracking-wider py-0 px-1.5"
                >
                  {currentUser.role}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign out"
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
