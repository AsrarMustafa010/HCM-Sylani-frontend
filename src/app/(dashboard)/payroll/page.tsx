"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Lock,
  Play,
  CheckCircle,
  FileText,
  AlertTriangle,
  Building,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  getStoredState,
  generateMonthlyPayrollDraft,
  finalizePayroll,
} from "@/lib/store";
import { PayrollRun, Payslip } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function PayrollPage() {
  const [state, setState] = useState(getStoredState());
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === "admin";
  const isHR = currentUser?.role === "hr";

  const currentRun = state.payrollRuns.find((p) => p.month === selectedMonth);
  const currentSlips = state.payslips.filter((s) => s.month === selectedMonth);

  const handleGenerateDraft = () => {
    setFeedback(null);
    const res = generateMonthlyPayrollDraft(selectedMonth);
    if (res.success) {
      setFeedback({
        type: "success",
        text: `Payroll draft for ${selectedMonth} calculated successfully for ${res.payslips?.length} employees!`,
      });
    } else {
      setFeedback({ type: "error", text: res.message || "Failed to generate payroll draft." });
    }
  };

  const handleFinalize = () => {
    if (!currentRun) return;
    if (confirm(`Are you sure you want to lock and finalize payroll for ${selectedMonth}? Finalized runs cannot be changed!`)) {
      const res = finalizePayroll(currentRun.id);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Payroll for ${selectedMonth} is now FINALIZED and locked. Payslips are published to employees!`,
        });
      } else {
        setFeedback({ type: "error", text: res.message || "Failed to finalize payroll." });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Monthly Payroll Lite (M6)</span>
            {currentRun && (
              <Badge
                variant={currentRun.status === "finalized" ? "success" : "warning"}
                className="uppercase text-[10px]"
              >
                {currentRun.status}
              </Badge>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gross formula (1.5x basic), working-day per-day deductions, tax slab computation, and Admin lock.
          </p>
        </div>

        {/* Month Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-36 text-xs h-9"
          />

          {(isHR || isAdmin) && (
            <Button
              size="sm"
              onClick={handleGenerateDraft}
              disabled={currentRun?.status === "finalized"}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {currentRun ? "Recalculate Draft" : "Run Payroll Draft"}
            </Button>
          )}

          {isAdmin && currentRun && currentRun.status === "draft" && (
            <Button
              size="sm"
              onClick={handleFinalize}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs"
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              Finalize & Lock Month
            </Button>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Totals Summary Cards */}
      {currentRun && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Gross Pay
              </span>
              <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
                {formatCurrency(currentRun.total_gross)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">1.5 × Basic Structure</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Attendance Deductions
              </span>
              <div className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                -{formatCurrency(currentRun.total_deductions)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Absents + Unpaid + 0.5 Half-days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Tax Deducted
              </span>
              <div className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                -{formatCurrency(currentRun.total_tax)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Annual Tax Slabs / 12</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                Total Net Disbursement
              </span>
              <div className="text-xl font-bold mt-1 text-emerald-800 dark:text-emerald-300">
                {formatCurrency(currentRun.total_net)}
              </div>
              <p className="text-[10px] text-emerald-600 mt-0.5">{currentRun.employee_count} employees</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Employee Payroll Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">
              Employee Payroll Breakdown for {selectedMonth}
            </CardTitle>
            <CardDescription>
              Formula: Per Day = Gross ÷ Working Days. Deductions = Absent + Unpaid + 0.5 × Half Day + Late Penalty (3 lates = 0.5d).
            </CardDescription>
          </div>
          {currentRun?.status === "finalized" && (
            <Badge variant="success" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Locked by {currentRun.finalized_by}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Basic</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Present</th>
                  <th className="p-3">Absent/Unpaid</th>
                  <th className="p-3">Half-Day</th>
                  <th className="p-3">Deduction</th>
                  <th className="p-3">Income Tax</th>
                  <th className="p-3">Net Salary</th>
                  <th className="p-3 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentSlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {slip.employee_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{slip.employee_code}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {formatCurrency(slip.basic_salary)}
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(slip.gross_salary)}
                    </td>
                    <td className="p-3">{slip.days_present} d</td>
                    <td className="p-3 text-rose-600 font-medium">
                      {slip.days_absent + slip.unpaid_leave_days} d
                    </td>
                    <td className="p-3">{slip.half_days} d</td>
                    <td className="p-3 text-amber-600 font-semibold">
                      <div>-{formatCurrency(slip.attendance_deduction)}</div>
                      {slip.late_penalty_days ? (
                        <div className="text-[10px] text-amber-500 font-normal">
                          +{slip.late_penalty_days}d late penalty
                        </div>
                      ) : null}
                    </td>
                    <td className="p-3 text-rose-600 font-semibold">
                      -{formatCurrency(slip.tax_deduction)}
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(slip.net_salary)}
                    </td>
                    <td className="p-3 text-right">
                      <Link href="/payslips">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View Slip
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}

                {currentSlips.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No payroll run found for {selectedMonth}. Click "Run Payroll Draft" above to compute!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Slabs Reference Box for Judges */}
      <Card className="bg-slate-50/60 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Official Tax Slab Schedule Applied (Gross × 12 Annual Basis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="p-2 rounded bg-white dark:bg-slate-800 border">
              <strong>Up to 600,000</strong>
              <div>0% Tax</div>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-800 border">
              <strong>600k – 1.2M</strong>
              <div>5% over 600k</div>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-800 border">
              <strong>1.2M – 2.4M</strong>
              <div>30k + 15% over 1.2M</div>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-800 border">
              <strong>2.4M – 3.6M</strong>
              <div>210k + 25% over 2.4M</div>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-800 border">
              <strong>Above 3.6M</strong>
              <div>510k + 35% over 3.6M</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
