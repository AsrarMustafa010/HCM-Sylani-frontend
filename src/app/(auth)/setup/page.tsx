"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { setupCompanyAndAdmin, getStoredState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";

export default function SetupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [officeStart, setOfficeStart] = useState("09:00");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [halfDayHours, setHalfDayHours] = useState(5);
  const [officeLat, setOfficeLat] = useState(24.8607);
  const [officeLng, setOfficeLng] = useState(67.0011);
  const [officeRadius, setOfficeRadius] = useState(150);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = getStoredState();
    if (state.isInitialized && state.currentUser) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleFillDemoValues = () => {
    setCompanyName("Saylani Tech Solutions");
    setAdminEmail("admin@saylani.com");
    setAdminPassword("Admin@123");
    setOfficeStart("09:00");
    setGraceMinutes(15);
    setHalfDayHours(5);
    setOfficeLat(24.8607);
    setOfficeLng(67.0011);
    setOfficeRadius(150);
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName.trim()) {
      setError("Please enter your Company Name.");
      return;
    }
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError("Please enter the Admin Email and Password.");
      return;
    }
    if (adminPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = setupCompanyAndAdmin({
        company_name: companyName,
        admin_email: adminEmail,
        admin_password: adminPassword,
        office_start: officeStart,
        grace_time_minutes: Number(graceMinutes),
        half_day_hours: Number(halfDayHours),
        office_lat: Number(officeLat),
        office_lng: Number(officeLng),
        office_radius_meters: Number(officeRadius),
      });

      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to initialize company setup.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <LogoIcon size={64} className="mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to HCM Lite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            First-Run Setup: Create your company workspace and Master Admin account. No dummy data — you start fresh.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillDemoValues}
            className="mt-3 text-xs border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Quick Auto-Fill For Hackathon Demo
          </Button>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Company Profile & Primary Admin</CardTitle>
            <CardDescription>
              Configured rules will automatically apply to attendance, leaves, and payroll.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-5 rounded-lg bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSetup} className="space-y-5">
              {/* Step 1: Company Profile */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Company Name</span>
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Saylani Tech Park"
                  required
                />
              </div>

              {/* Step 2: Primary Admin Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Admin Email</span>
                  </label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Admin Password
                  </label>
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Step 3: Office Hours & Rules */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 mb-3">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Office Timing & Attendance Rules</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Office Start</span>
                    <Input
                      type="time"
                      value={officeStart}
                      onChange={(e) => setOfficeStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Grace (min)</span>
                    <Input
                      type="number"
                      value={graceMinutes}
                      onChange={(e) => setGraceMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Half-day Threshold (hrs)</span>
                    <Input
                      type="number"
                      value={halfDayHours}
                      onChange={(e) => setHalfDayHours(Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Arrivals after 09:15 AM marked Late. Work under 5h marked Half-Day.
                </p>
              </div>

              {/* Step 4: Office GPS Coordinates */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Office Geofence (Camera Attendance)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Latitude</span>
                    <Input
                      type="number"
                      step="0.0001"
                      value={officeLat}
                      onChange={(e) => setOfficeLat(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Longitude</span>
                    <Input
                      type="number"
                      step="0.0001"
                      value={officeLng}
                      onChange={(e) => setOfficeLng(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Radius (meters)</span>
                    <Input
                      type="number"
                      value={officeRadius}
                      onChange={(e) => setOfficeRadius(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
              >
                {loading ? "Initializing..." : "Launch Company Workspace"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
