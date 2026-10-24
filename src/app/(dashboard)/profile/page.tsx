"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Lock,
  Save,
  CheckCircle,
} from "lucide-react";
import { getStoredState, updateEmployeeDetails } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [state, setState] = useState(getStoredState());
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const employee = state.employees.find((e) => e.id === currentUser?.employee_id);

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || "");
      setAddress(employee.address || "");
    }
  }, [employee]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !currentUser) return;

    updateEmployeeDetails(
      employee.id,
      { phone, address },
      currentUser.role
    );

    setSuccessMsg("Profile details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Profile & Self-Service
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your employment details and keep your personal contact information up to date.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 border border-emerald-200">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal Snapshot */}
        <Card className="text-center p-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-indigo-500/20 mb-3">
            {employee ? `${employee.first_name[0]}${employee.last_name[0]}` : "U"}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {employee ? `${employee.first_name} ${employee.last_name}` : currentUser?.email}
          </h2>
          <Badge variant="secondary" className="font-mono text-xs mt-1">
            {employee?.employee_code || "STAFF"}
          </Badge>
          <p className="text-xs text-slate-500 mt-2">
            {employee?.designation_title} · {employee?.department_name}
          </p>

          <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold uppercase">{currentUser?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-600 uppercase">
                {employee?.status || "Active"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Join Date:</span>
              <span>{formatDate(employee?.join_date || "")}</span>
            </div>
          </div>
        </Card>

        {/* Right Columns: Editable Contact & Compensation info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>
                Company policy allows self-service updates for personal phone number and residential address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Official Email
                  </label>
                  <Input value={employee?.email || currentUser?.email} disabled className="opacity-70" />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Official email is managed by Company Admin.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Residential Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Karachi, Pakistan"
                    required
                  />
                </div>

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Contact Updates
                </Button>
              </form>
            </CardContent>
          </Card>

          {employee && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  <span>My Compensation Structure</span>
                </CardTitle>
                <CardDescription>
                  Your contracted salary breakdown. Employees cannot edit own salary.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase">Basic</span>
                  <div className="font-bold mt-0.5">{formatCurrency(employee.basic_salary)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase">HRA (40%)</span>
                  <div className="font-bold mt-0.5">
                    {formatCurrency(employee.salary_structure?.hra || employee.basic_salary * 0.4)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] uppercase">Medical (10%)</span>
                  <div className="font-bold mt-0.5">
                    {formatCurrency(employee.salary_structure?.medical_allowance || employee.basic_salary * 0.1)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
                  <span className="text-[10px] uppercase">Gross (1.5x)</span>
                  <div className="font-bold mt-0.5">
                    {formatCurrency(employee.salary_structure?.gross_salary || employee.basic_salary * 1.5)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
