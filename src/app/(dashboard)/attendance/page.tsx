"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
  Camera,
  Globe,
} from "lucide-react";
import {
  getStoredState,
  requestCorrection,
  reviewCorrection,
} from "@/lib/store";
import { AttendanceRecord, AttendanceCorrection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

export default function AttendancePage() {
  const [state, setState] = useState(getStoredState());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterDept, setFilterDept] = useState("all");
  const [activeTab, setActiveTab] = useState<"board" | "corrections">("board");

  // Correction Request Modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [corrDate, setCorrDate] = useState(selectedDate);
  const [corrIn, setCorrIn] = useState("09:00");
  const [corrOut, setCorrOut] = useState("17:30");
  const [corrReason, setCorrReason] = useState("");

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const currentUser = state.currentUser;
  const isEmployee = currentUser?.role === "employee";
  const canApprove = currentUser?.role === "hr" || currentUser?.role === "admin";

  // Filtered records
  const filteredAttendance = state.attendance.filter((a) => {
    const matchesDate = a.date === selectedDate;
    if (isEmployee) {
      return a.employee_id === currentUser.employee_id;
    }
    const emp = state.employees.find((e) => e.id === a.employee_id);
    const matchesDept = filterDept === "all" || emp?.department_id === filterDept;
    return matchesDate && matchesDept;
  });

  const handleRequestCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.employee_id) return;

    requestCorrection({
      employee_id: currentUser.employee_id,
      date: corrDate,
      requested_check_in: corrIn,
      requested_check_out: corrOut,
      reason: corrReason,
    });

    setCorrectionModalOpen(false);
    setCorrReason("");
  };

  const handleReviewCorrection = (id: string, status: "approved" | "rejected") => {
    const comment = prompt(`Enter ${status} comment for attendance correction:`);
    if (comment === null) return;
    reviewCorrection(id, status, comment.trim() || "Reviewed by HR");
  };

  const pendingCorrections = state.attendanceCorrections.filter((c) =>
    isEmployee ? c.employee_id === currentUser.employee_id : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Daily Attendance Board (M4)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor punctuality, working hours, and review attendance correction requests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isEmployee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCorrectionModalOpen(true)}
              className="text-xs"
            >
              <FileEdit className="h-3.5 w-3.5 mr-1.5" />
              Request Correction
            </Button>
          )}

          <Link href="/attendance/checkin">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Check-In Console
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("board")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "board"
              ? "border-slate-900 text-slate-900 dark:border-white dark:text-white font-bold"
              : "border-transparent text-slate-500"
          }`}
        >
          Attendance Records
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "corrections"
              ? "border-slate-900 text-slate-900 dark:border-white dark:text-white font-bold"
              : "border-transparent text-slate-500"
          }`}
        >
          Corrections Inbox ({pendingCorrections.filter((c) => c.status === "pending").length})
        </button>
      </div>

      {activeTab === "board" && (
        <div className="space-y-4">
          {/* Controls: Date picker & Department */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500">Date:</span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40 text-xs"
                />
              </div>

              {!isEmployee && (
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="h-9 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
                  >
                    <option value="all">All Departments</option>
                    {state.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                    <tr>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Check-In</th>
                      <th className="p-3.5">Check-Out</th>
                      <th className="p-3.5">Work Hours</th>
                      <th className="p-3.5">Source</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                          {rec.employee_name}
                        </td>
                        <td className="p-3.5 text-slate-500">{rec.department_name || "General"}</td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {rec.check_in || "—"}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {rec.check_out || "—"}
                        </td>
                        <td className="p-3.5">
                          {rec.work_hours ? `${rec.work_hours} hrs` : "In Progress"}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center space-x-1 uppercase text-[10px] text-slate-400">
                            {rec.check_in_source === "camera" ? (
                              <Camera className="h-3 w-3 text-slate-700 dark:text-slate-300" />
                            ) : (
                              <Globe className="h-3 w-3 text-slate-400" />
                            )}
                            <span>{rec.check_in_source}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              rec.status === "present"
                                ? "success"
                                : rec.status === "late"
                                ? "warning"
                                : rec.status === "half_day"
                                ? "secondary"
                                : "destructive"
                            }
                            className="uppercase text-[10px]"
                          >
                            {rec.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {filteredAttendance.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No attendance records found for {selectedDate}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CORRECTIONS INBOX TAB */}
      {activeTab === "corrections" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Attendance Correction Requests</CardTitle>
            <CardDescription>
              Employees request corrections with reasons. HR approves or updates the record.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                  <tr>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Requested Hours</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    {canApprove && <th className="p-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingCorrections.map((corr) => (
                    <tr key={corr.id}>
                      <td className="p-3.5 font-medium">{corr.employee_name}</td>
                      <td className="p-3.5">{corr.date}</td>
                      <td className="p-3.5 font-mono">
                        {corr.requested_check_in} – {corr.requested_check_out}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {corr.reason}
                        {corr.reviewer_comment && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            HR Note: {corr.reviewer_comment}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            corr.status === "approved"
                              ? "success"
                              : corr.status === "rejected"
                              ? "destructive"
                              : "warning"
                          }
                          className="capitalize text-[10px]"
                        >
                          {corr.status}
                        </Badge>
                      </td>
                      {canApprove && (
                        <td className="p-3.5 text-right">
                          {corr.status === "pending" ? (
                            <div className="flex items-center justify-end space-x-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleReviewCorrection(corr.id, "approved")}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewCorrection(corr.id, "rejected")}
                                className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Reviewed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  {pendingCorrections.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No correction requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Correction Modal */}
      <Modal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Request Attendance Correction"
        description="Provide correct check-in/out times along with reason for HR review."
      >
        <form onSubmit={handleRequestCorrection} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Date</label>
            <Input
              type="date"
              value={corrDate}
              onChange={(e) => setCorrDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600">Actual Check-In</label>
              <Input
                type="time"
                value={corrIn}
                onChange={(e) => setCorrIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600">Actual Check-Out</label>
              <Input
                type="time"
                value={corrOut}
                onChange={(e) => setCorrOut(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-600">Reason for Correction</label>
            <Input
              value={corrReason}
              onChange={(e) => setCorrReason(e.target.value)}
              placeholder="e.g. Forgot to punch out due to client meeting"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Correction Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
