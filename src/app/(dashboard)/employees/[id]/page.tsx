"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  CalendarCheck,
  Calendar,
  FileText,
  ArrowLeft,
  Edit2,
  Check,
} from "lucide-react";
import {
  getStoredState,
  updateEmployeeDetails,
  getEmployeeLeaveBalances,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function Employee360Page() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [state, setState] = useState(getStoredState());
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [basicSalary, setBasicSalary] = useState(0);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const employee = state.employees.find((e) => e.id === employeeId);
  const currentUser = state.currentUser;

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone);
      setAddress(employee.address);
      setBasicSalary(employee.basic_salary);
    }
  }, [employee]);

  if (!employee) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Employee record not found.
      </div>
    );
  }

  // Permission check: employee can only see own profile unless HR/Admin
  if (currentUser?.role === "employee" && currentUser.employee_id !== employee.id) {
    return (
      <div className="p-8 text-center text-xs text-rose-500">
        Access Denied: You are not authorized to view colleague records.
      </div>
    );
  }

  const isSelf = currentUser?.employee_id === employee.id;
  const canEditSalary = currentUser?.role === "hr" || currentUser?.role === "admin";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateEmployeeDetails(
      employee.id,
      {
        phone,
        address,
        ...(canEditSalary ? { basic_salary: Number(basicSalary) } : {}),
      },
      currentUser.role
    );
    setIsEditing(false);
  };

  // 360 data
  const attendanceHistory = state.attendance.filter((a) => a.employee_id === employee.id);
  const leaveHistory = state.leaveRequests.filter((l) => l.employee_id === employee.id);
  const payslipsHistory = state.payslips.filter((p) => p.employee_id === employee.id);
  const leaveBalances = getEmployeeLeaveBalances(employee.id);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/employees"
          className="flex items-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Directory
        </Link>

        <div>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit Details
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-indigo-600 text-white">
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/20">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">
                    {employee.first_name} {employee.last_name}
                  </h2>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {employee.employee_code}
                  </Badge>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5">
                  {employee.designation_title} · {employee.department_name}
                </p>
                <div className="flex items-center space-x-3 text-xs text-slate-300 mt-2">
                  <span className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                    {employee.email}
                  </span>
                  <span className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                    {employee.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-indigo-200">Current Status</span>
              <div>
                <Badge variant="success" className="uppercase text-xs mt-1">
                  {employee.status}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-300 mt-2">
                Joined: {formatDate(employee.join_date)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit or Info Grid */}
      {isEditing && (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Edit Profile Information</CardTitle>
            <CardDescription>
              {isSelf && !canEditSalary
                ? "Self-service policy allows updating your contact phone and address."
                : "HR privilege: update job and salary settings."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {canEditSalary && (
                <div>
                  <label className="font-semibold text-slate-600">Basic Salary (PKR)</label>
                  <Input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                  />
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* 360 Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Compensation Structure (Section 3 & 6) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <span>Salary Structure (M6)</span>
            </CardTitle>
            <CardDescription>Standard: Gross = 1.5 × Basic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Basic Salary:</span>
              <span className="font-semibold">{formatCurrency(employee.basic_salary)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">HRA Allowance (40%):</span>
              <span className="font-semibold">
                {formatCurrency(employee.salary_structure?.hra || employee.basic_salary * 0.4)}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Medical Allowance (10%):</span>
              <span className="font-semibold">
                {formatCurrency(employee.salary_structure?.medical_allowance || employee.basic_salary * 0.1)}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
              <span>Gross Salary:</span>
              <span>{formatCurrency(employee.salary_structure?.gross_salary || employee.basic_salary * 1.5)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Middle Column: Leave Quota & History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Leave Balances (M5)</span>
            </CardTitle>
            <CardDescription>Yearly allowances & utilized days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {leaveBalances.map((bal) => (
              <div
                key={bal.leave_type_id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {bal.leave_type_name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Used: {bal.used} / {bal.quota === 0 ? "∞" : bal.quota}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {bal.remaining === 999 ? "∞" : bal.remaining}
                  </span>
                  <div className="text-[9px] text-slate-400">Remaining</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Attendance Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <CalendarCheck className="h-4 w-4 text-indigo-500" />
              <span>Recent Attendance (M4)</span>
            </CardTitle>
            <CardDescription>Latest daily check-in logs</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No records logged yet.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {attendanceHistory.slice(0, 4).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-medium">{att.date}</div>
                      <div className="text-[10px] text-slate-400">
                        In: {att.check_in || "—"} · Out: {att.check_out || "—"}
                      </div>
                    </div>
                    <Badge
                      variant={att.status === "present" ? "success" : att.status === "late" ? "warning" : "secondary"}
                      className="text-[9px] uppercase"
                    >
                      {att.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
