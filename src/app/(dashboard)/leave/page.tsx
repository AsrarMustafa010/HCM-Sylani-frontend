"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  getStoredState,
  getEmployeeLeaveBalances,
  applyForLeave,
  reviewLeaveRequest,
  parseSmartLeaveText,
} from "@/lib/store";
import { LeaveRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { triggerConfetti } from "@/lib/confetti";

export default function LeavePage() {
  const [state, setState] = useState(getStoredState());
  const [activeTab, setActiveTab] = useState<"balances" | "requests">("balances");

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  // Smart Leave Plain Text prompt state (M8 / Feature 21)
  const [smartPrompt, setSmartPrompt] = useState("");
  const [isSmartLoading, setIsSmartLoading] = useState(false);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const isEmployee = currentUser?.role === "employee";
  const canApprove = currentUser?.role === "hr" || currentUser?.role === "admin";

  const balances = currentUser?.employee_id
    ? getEmployeeLeaveBalances(currentUser.employee_id)
    : [];

  const requests = isEmployee
    ? state.leaveRequests.filter((l) => l.employee_id === currentUser.employee_id)
    : state.leaveRequests;

  // Smart Leave NLP parser handler
  const handleSmartLeaveParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartPrompt.trim()) return;

    setIsSmartLoading(true);
    setTimeout(() => {
      const draft = parseSmartLeaveText(smartPrompt);
      const matchedType = state.leaveTypes.find(
        (t) => t.name.toLowerCase() === draft.leave_type.toLowerCase()
      ) || state.leaveTypes[0];

      setSelectedTypeId(matchedType.id);
      setStartDate(draft.start_date);
      setEndDate(draft.end_date);
      setReason(draft.reason);

      setIsSmartLoading(false);
      setApplyModalOpen(true);
    }, 400);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");
    setApplySuccess("");

    if (!currentUser?.employee_id) {
      setApplyError("You must be logged in as an employee to apply for leave.");
      return;
    }
    if (!selectedTypeId) {
      setApplyError("Please select a leave type.");
      return;
    }

    const res = applyForLeave({
      employee_id: currentUser.employee_id,
      leave_type_id: selectedTypeId,
      start_date: startDate,
      end_date: endDate,
      reason,
    });

    if (res.success) {
      setApplySuccess("Leave request submitted for HR approval!");
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess("");
        setReason("");
      }, 1500);
    } else {
      setApplyError(res.message || "Failed to submit leave request.");
    }
  };

  const handleReview = (id: string, decision: "approved" | "rejected") => {
    const comment = prompt(`Enter ${decision} comment for this leave request:`);
    if (comment === null) return;
    reviewLeaveRequest(id, decision, comment.trim() || "Reviewed by HR");
    if (decision === "approved") {
      triggerConfetti();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Leave Management & Smart Leave (M5 & M8)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Yearly quotas, working-day validation (skips weekends/holidays), overlap guard, and AI smart parser.
          </p>
        </div>

        {isEmployee && (
          <Button
            size="sm"
            onClick={() => {
              setApplyError("");
              setApplySuccess("");
              setSelectedTypeId(state.leaveTypes[0]?.id || "");
              setApplyModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Apply For Leave
          </Button>
        )}
      </div>

      {/* SMART LEAVE NATURAL LANGUAGE BAR (Hero Section 4 Requirement) */}
      {isEmployee && (
        <Card className="border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
              <span>Smart Leave: Type your request in plain English or Roman Urdu</span>
            </div>

            <form onSubmit={handleSmartLeaveParse} className="flex flex-col sm:flex-row gap-2">
              <Input
                value={smartPrompt}
                onChange={(e) => setSmartPrompt(e.target.value)}
                placeholder='e.g. "Need next Monday and Tuesday off for sister&apos;s wedding" or "Feeling unwell kal fever ki chutti chahiye"'
                className="text-xs bg-white dark:bg-slate-900"
              />
              <Button
                type="submit"
                disabled={!smartPrompt.trim() || isSmartLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs shrink-0"
              >
                {isSmartLoading ? "Parsing..." : "AI Auto-Fill Form"}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </form>
            <p className="text-[10px] text-slate-500 mt-1.5">
              AI automatically detects leave category, computes working dates, pre-fills the form, and checks quota balance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Leave Balances Grid (If Employee) */}
      {isEmployee && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Your Yearly Leave Allowances & Balances
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {balances.map((b) => (
              <Card key={b.leave_type_id}>
                <CardContent className="p-4">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {b.leave_type_name}
                  </div>
                  <div className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                    {b.remaining === 999 ? "∞" : b.remaining}{" "}
                    <span className="text-xs font-normal text-slate-400">days left</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Used: {b.used} / {b.quota === 0 ? "Unlimited" : b.quota}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leave Requests & Approval Inbox */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">
                {canApprove ? "Leave Approval Inbox (HR Review)" : "My Leave History"}
              </CardTitle>
              <CardDescription>
                {canApprove
                  ? "Review staff leave applications. Approved unpaid leaves will be deducted in payroll."
                  : "Track approval status and reviewer comments."}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {requests.length} Total Requests
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Leave Type</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Working Days</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                  {canApprove && <th className="p-3.5 text-right">Decision</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      {leave.employee_name}
                    </td>
                    <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                      {leave.leave_type_name}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {leave.start_date} → {leave.end_date}
                    </td>
                    <td className="p-3.5 font-bold">{leave.days_count} Days</td>
                    <td className="p-3.5 max-w-xs text-slate-500">
                      <div>{leave.reason}</div>
                      {leave.reviewer_comment && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          HR Comment: {leave.reviewer_comment}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          leave.status === "approved"
                            ? "success"
                            : leave.status === "rejected"
                            ? "destructive"
                            : "warning"
                        }
                        className="uppercase text-[10px]"
                      >
                        {leave.status}
                      </Badge>
                    </td>
                    {canApprove && (
                      <td className="p-3.5 text-right">
                        {leave.status === "pending" ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleReview(leave.id, "approved")}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(leave.id, "rejected")}
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply For Leave"
        description="Select category and dates. Non-working days (weekends and public holidays) are skipped automatically."
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          {applyError && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 flex items-center space-x-1.5 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          {applySuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 flex items-center space-x-1.5 border border-emerald-200">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{applySuccess}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-600">Leave Category</label>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 mt-1"
              required
            >
              <option value="">Select Leave Type</option>
              {state.leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.yearly_quota === 0 ? "Unlimited" : `${t.yearly_quota} days quota`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-600">Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending sister's wedding in Lahore"
              required
            />
          </div>

          <Button type="submit" className="w-full h-10 font-semibold bg-indigo-600 hover:bg-indigo-700">
            Submit Leave Application
          </Button>
        </form>
      </Modal>
    </div>
  );
}
