"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { getStoredState, changePasswordAsync } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const state = getStoredState();
    if (!state.currentUser) {
      router.replace("/login");
    } else {
      setCurrentUser(state.currentUser);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword.trim()) {
      setError("Please enter your temporary/current password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long (with uppercase, lowercase, number, and special character).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await changePasswordAsync(currentUser.id, newPassword, currentPassword);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.message || "Failed to change password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set Your Permanent Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            First-time sign in detected. Company security policy requires updating your temporary password.
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Account: {currentUser?.email}</CardTitle>
            <CardDescription>
              Choose a strong password to protect your employee self-service portal.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Temporary / Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter temporary password from email"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  New Password (min 8 chars, e.g. Emp@9999)
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                {loading ? "Updating..." : "Update Password & Continue"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
