"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Shield, Lock, ArrowRight, UserCheck, Sparkles, Eye, EyeOff } from "lucide-react";
import {
  loginUserAsync,
  getStoredState,
  syncFromBackend,
  forgotPasswordAsync,
  resetPasswordWithOtpAsync,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(getStoredState());
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [forgotMessage, setForgotMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    setState(getStoredState());
    syncFromBackend().then((currentState) => {
      setState(currentState);
      if (!currentState.isInitialized || !currentState.companySettings) {
        router.replace("/setup");
      } else if (currentState.currentUser) {
        if (currentState.currentUser.must_change_password) {
          router.replace("/change-password");
        } else {
          router.replace("/dashboard");
        }
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginUserAsync(email, password);
    if (res.success && res.user) {
      if (res.user.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(res.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const fillQuickLogin = (role: "admin" | "hr" | "employee") => {
    const targetUser = state.users.find((u) => u.role === role);
    if (targetUser) {
      setEmail(targetUser.email);
      setPassword(role === "admin" ? "Admin@1234" : role === "hr" ? "Hr@12345" : "Welcome@123");
    } else if (role === "admin") {
      setEmail("admin@saylani.com");
      setPassword("Admin@1234");
    } else {
      setError(`Log in as Admin first to create an ${role.toUpperCase()} account!`);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    try {
      const res = await forgotPasswordAsync(forgotEmail);
      setForgotMessage(res.message);
      setForgotStep("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send reset OTP.");
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    try {
      const res = await resetPasswordWithOtpAsync({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      });
      setForgotMessage(res.message);
      setEmail(forgotEmail);
      setPassword(forgotNewPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep("email");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired OTP.");
    }
  };

  const companyName = mounted ? (state.companySettings?.company_name || "HCM Lite") : "HCM Lite";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <LogoIcon size={56} className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Human Capital Management & AI System
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base font-bold">Sign In to Your Workspace</CardTitle>
            <CardDescription>
              Role and data-scope checked for every session.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                className="w-full h-10 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                {loading ? "Authenticating..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(!showForgotModal);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  Forgot Password? (Reset via Email OTP)
                </button>
              </div>
            </form>

            {showForgotModal && (
              <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Reset Password via Email OTP
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                {forgotMessage && (
                  <p className="text-[11px] text-emerald-600 font-medium">{forgotMessage}</p>
                )}
                {forgotStep === "email" ? (
                  <form onSubmit={handleSendResetOtp} className="space-y-2">
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Your registered email"
                      required
                    />
                    <Button type="submit" size="sm" className="w-full text-xs">
                      Send 6-Digit OTP to Email
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyResetOtp} className="space-y-2">
                    <Input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="6-Digit OTP"
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showForgotNewPassword ? "text" : "password"}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="New Password (e.g. NewPass@1234)"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        tabIndex={-1}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                        aria-label={showForgotNewPassword ? "Hide password" : "Show password"}
                      >
                        {showForgotNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs">
                      Verify OTP & Update Password
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Quick Demo Switchers for Judges */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1 mb-2">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Judge Quick Fill</span>
              </span>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillQuickLogin("admin")}
                  className="text-xs h-7 px-2.5"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillQuickLogin("hr")}
                  className="text-xs h-7 px-2.5"
                >
                  HR
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillQuickLogin("employee")}
                  className="text-xs h-7 px-2.5"
                >
                  Employee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
