"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Shield, Lock, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import { loginUser, getStoredState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(getStoredState());

  useEffect(() => {
    const currentState = getStoredState();
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
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = loginUser(email, password);
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
      setPassword(targetUser.password_hash);
    } else {
      setError(`No ${role.toUpperCase()} user found in system yet. Login as Admin first to create one!`);
    }
  };

  const companyName = state.companySettings?.company_name || "HCM Lite";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {companyName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Human Capital Management & AI System
          </p>
        </div>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base">Sign In to Your Workspace</CardTitle>
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
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-semibold bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Authenticating..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

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
