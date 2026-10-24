"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  User,
} from "lucide-react";
import { getStoredState } from "@/lib/store";
import { Payslip } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PayslipsPage() {
  const [state, setState] = useState(getStoredState());
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const isEmployee = currentUser?.role === "employee";

  // Filtered payslips
  const payslips = isEmployee
    ? state.payslips.filter((p) => p.employee_id === currentUser.employee_id)
    : state.payslips;

  useEffect(() => {
    if (payslips.length > 0 && !selectedSlip) {
      setSelectedSlip(payslips[0]);
    }
  }, [payslips, selectedSlip]);

  const handlePrint = () => {
    window.print();
  };

  const company = state.companySettings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Payslips & Salary Stubs (M6 & M7)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEmployee
              ? "Download your official monthly salary vouchers and tax deduction breakdowns."
              : "View all generated staff payslips across finalized payroll months."}
          </p>
        </div>

        {selectedSlip && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Payslips */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Vouchers ({payslips.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {payslips.map((slip) => {
              const isSelected = selectedSlip?.id === slip.id;
              return (
                <div
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? "border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {slip.month}
                    </span>
                    <Badge
                      variant={slip.status === "finalized" ? "success" : "warning"}
                      className="text-[9px] uppercase"
                    >
                      {slip.status}
                    </Badge>
                  </div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 mt-1">
                    {slip.employee_name} ({slip.employee_code})
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mt-2">
                    <span>Net Take-home:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(slip.net_salary)}
                    </span>
                  </div>
                </div>
              );
            })}

            {payslips.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-xs text-slate-400">
                  No payslips generated yet. HR/Admin must run a monthly payroll draft first.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: High-Fidelity Printable Payslip Card */}
        <div className="lg:col-span-2">
          {selectedSlip ? (
            <Card
              id="printable-payslip"
              className="border-slate-300 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900 overflow-hidden"
            >
              {/* Slip Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {company?.company_name || "HCM Lite"}
                      </h2>
                      <p className="text-xs text-slate-500">Official Monthly Salary Voucher</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={selectedSlip.status === "finalized" ? "success" : "warning"}
                      className="text-xs uppercase"
                    >
                      {selectedSlip.status}
                    </Badge>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      Period: {selectedSlip.month}
                    </div>
                  </div>
                </div>

                {/* Employee Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Employee Name
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedSlip.employee_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Employee Code
                    </span>
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedSlip.employee_code}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Department
                    </span>
                    <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedSlip.department_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      Designation
                    </span>
                    <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedSlip.designation_title}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Breakdown */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <span>
                    Standard Working Days: <strong>{selectedSlip.working_days}</strong>
                  </span>
                  <span>
                    Days Present: <strong className="text-emerald-600">{selectedSlip.days_present}</strong>
                  </span>
                  <span>
                    Absent / Unpaid: <strong className="text-rose-600">{selectedSlip.days_absent + selectedSlip.unpaid_leave_days}</strong>
                  </span>
                  <span>
                    Half-days: <strong>{selectedSlip.half_days}</strong>
                  </span>
                  <span>
                    Per-Day Rate: <strong>{formatCurrency(selectedSlip.per_day_salary)}</strong>
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Earnings */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-1">
                      Earnings Breakdown
                    </h4>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Basic Salary:</span>
                      <span className="font-medium">{formatCurrency(selectedSlip.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">House Rent Allowance (40%):</span>
                      <span className="font-medium">{formatCurrency(selectedSlip.hra)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Medical Allowance (10%):</span>
                      <span className="font-medium">{formatCurrency(selectedSlip.medical_allowance)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold text-slate-900 dark:text-white">
                      <span>Total Gross Pay:</span>
                      <span>{formatCurrency(selectedSlip.gross_salary)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-1">
                      Deductions Breakdown
                    </h4>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Attendance Deductions:</span>
                      <span className="text-rose-600 font-medium">
                        -{formatCurrency(selectedSlip.attendance_deduction)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Income Tax (Annual Slab ÷ 12):</span>
                      <span className="text-rose-600 font-medium">
                        -{formatCurrency(selectedSlip.tax_deduction)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold text-rose-600">
                      <span>Total Deductions:</span>
                      <span>
                        -{formatCurrency(selectedSlip.attendance_deduction + selectedSlip.tax_deduction)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Net Pay Callout */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-100 font-medium">
                      Net Take-Home Pay
                    </span>
                    <div className="text-2xl font-black mt-0.5">
                      {formatCurrency(selectedSlip.net_salary)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-100">
                    <div>Disbursed via Direct Transfer</div>
                    <div className="font-mono text-[10px] text-emerald-200">
                      ID: {selectedSlip.id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-xs text-slate-400">
                Select a payslip from the list to view and download.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
