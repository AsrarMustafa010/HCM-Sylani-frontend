"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  Clock,
  MapPin,
  Plus,
  Trash2,
  UserPlus,
  Shield,
  Calendar,
  Layers,
  Save,
  CheckCircle,
} from "lucide-react";
import {
  getStoredState,
  saveState,
  createHRUser,
  logAudit,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function OrganizationPage() {
  const [state, setState] = useState(getStoredState());
  const [activeTab, setActiveTab] = useState<"settings" | "hr_logins" | "departments" | "leave_types" | "holidays">("settings");

  // Form states
  const [companyName, setCompanyName] = useState(state.companySettings?.company_name || "");
  const [officeStart, setOfficeStart] = useState(state.companySettings?.office_start || "09:00");
  const [graceMinutes, setGraceMinutes] = useState(state.companySettings?.grace_time_minutes ?? 15);
  const [halfDayHours, setHalfDayHours] = useState(state.companySettings?.half_day_hours ?? 5);
  const [officeLat, setOfficeLat] = useState(state.companySettings?.office_lat || 24.8607);
  const [officeLng, setOfficeLng] = useState(state.companySettings?.office_lng || 67.0011);
  const [officeRadius, setOfficeRadius] = useState(state.companySettings?.office_radius_meters || 150);

  // New HR User modal
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");
  const [hrMsg, setHrMsg] = useState("");

  // New Dept modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  // New Holiday modal
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const isAdmin = state.currentUser?.role === "admin";

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const s = getStoredState();
    if (s.companySettings) {
      s.companySettings.company_name = companyName;
      s.companySettings.office_start = officeStart;
      s.companySettings.grace_time_minutes = Number(graceMinutes);
      s.companySettings.half_day_hours = Number(halfDayHours);
      s.companySettings.office_lat = Number(officeLat);
      s.companySettings.office_lng = Number(officeLng);
      s.companySettings.office_radius_meters = Number(officeRadius);
      saveState(s);

      logAudit(
        { email: s.currentUser?.email || "admin", role: "admin" },
        "update",
        "company",
        `Updated company settings: Office start ${officeStart}, Grace ${graceMinutes}m, Geofence radius ${officeRadius}m`
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleCreateHR = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createHRUser(hrEmail, hrPassword);
    if (res.success) {
      setHrModalOpen(false);
      setHrEmail("");
      setHrPassword("");
      setHrMsg("");
    } else {
      setHrMsg(res.message || "Failed to create HR login");
    }
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const s = getStoredState();
    const newDept = {
      id: "dept-" + Date.now(),
      name: deptName,
      code: deptCode.toUpperCase(),
      description: deptDesc,
    };
    s.departments.push(newDept);
    saveState(s);
    setDeptModalOpen(false);
    setDeptName("");
    setDeptCode("");
    setDeptDesc("");
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    const s = getStoredState();
    s.holidays.push({
      id: "h-" + Date.now(),
      name: holidayName,
      date: holidayDate,
    });
    saveState(s);
    setHolidayModalOpen(false);
    setHolidayName("");
    setHolidayDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organization Setup & Rules (M2)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure office hours, geofence, departments, leave quotas, and HR logins.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 font-medium border-b-2 transition ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Company Rules & Geofence
        </button>
        <button
          onClick={() => setActiveTab("hr_logins")}
          className={`px-4 py-2.5 font-medium border-b-2 transition ${
            activeTab === "hr_logins"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          HR Logins ({state.users.filter((u) => u.role === "hr").length})
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2.5 font-medium border-b-2 transition ${
            activeTab === "departments"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Departments ({state.departments.length})
        </button>
        <button
          onClick={() => setActiveTab("leave_types")}
          className={`px-4 py-2.5 font-medium border-b-2 transition ${
            activeTab === "leave_types"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Leave Types & Quotas
        </button>
        <button
          onClick={() => setActiveTab("holidays")}
          className={`px-4 py-2.5 font-medium border-b-2 transition ${
            activeTab === "holidays"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Public Holidays ({state.holidays.length})
        </button>
      </div>

      {/* TAB 1: COMPANY SETTINGS */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Office Timings & Location Geofence</CardTitle>
            <CardDescription>
              Rules set here decide attendance status (late, half-day, distance check). Stored as settings, applied to new records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedSuccess && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-1.5 border border-emerald-200">
                <CheckCircle className="h-4 w-4" />
                <span>Settings saved and logged to audit trail successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Company Name
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Office Start Time
                  </label>
                  <Input
                    type="time"
                    value={officeStart}
                    onChange={(e) => setOfficeStart(e.target.value)}
                    disabled={!isAdmin}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: 09:00 AM</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Grace Time (Minutes)
                  </label>
                  <Input
                    type="number"
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(Number(e.target.value))}
                    disabled={!isAdmin}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Late after 09:15 AM</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Half-Day Threshold (Hours)
                  </label>
                  <Input
                    type="number"
                    value={halfDayHours}
                    onChange={(e) => setHalfDayHours(Number(e.target.value))}
                    disabled={!isAdmin}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Under 5 hours = Half-day</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Office Location Geofence (Haversine Formula)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500">Latitude</span>
                    <Input
                      type="number"
                      step="0.0001"
                      value={officeLat}
                      onChange={(e) => setOfficeLat(Number(e.target.value))}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Longitude</span>
                    <Input
                      type="number"
                      step="0.0001"
                      value={officeLng}
                      onChange={(e) => setOfficeLng(Number(e.target.value))}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Allowed Radius (meters)</span>
                    <Input
                      type="number"
                      value={officeRadius}
                      onChange={(e) => setOfficeRadius(Number(e.target.value))}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Button type="submit" className="mt-2">
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Company Settings
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: HR LOGINS */}
      {activeTab === "hr_logins" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">HR User Accounts (M1 & M2)</CardTitle>
              <CardDescription>
                Admin creates HR logins. HR manages employees and daily approvals.
              </CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setHrModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Create HR Login
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {state.users
                    .filter((u) => u.role === "hr")
                    .map((hr) => (
                      <tr key={hr.id}>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                          {hr.email}
                        </td>
                        <td className="p-3">
                          <Badge variant="success">HR</Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-600 font-medium">Active</span>
                        </td>
                        <td className="p-3 text-slate-400">{formatDate(hr.created_at)}</td>
                      </tr>
                    ))}
                  {state.users.filter((u) => u.role === "hr").length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No HR accounts created yet. Click "Create HR Login" above to register one for the demo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === "departments" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Company Departments</CardTitle>
              <CardDescription>Organize staff into operational units</CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setDeptModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Department
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {state.departments.map((dept) => {
                const count = state.employees.filter((e) => e.department_id === dept.id).length;
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {dept.name}
                      </h4>
                      <Badge variant="secondary">{dept.code}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{dept.description || "—"}</p>
                    <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {count} Employees Assigned
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: LEAVE TYPES */}
      {activeTab === "leave_types" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Types & Standard Yearly Quotas (M5)</CardTitle>
            <CardDescription>
              Annual 14, Sick 8, Casual 10; Unpaid unlimited. Overlap or over-balance is rejected with 422.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {state.leaveTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {type.name}
                    </span>
                    <Badge variant="outline">{type.code}</Badge>
                  </div>
                  <div className="text-2xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">
                    {type.yearly_quota === 0 ? "Unlimited" : `${type.yearly_quota} Days`}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {type.is_paid ? "Fully Paid Leave" : "Unpaid (Deducted in Payroll)"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: HOLIDAYS */}
      {activeTab === "holidays" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Official Public Holidays</CardTitle>
              <CardDescription>
                Public holidays are automatically skipped when calculating leave duration and payroll days.
              </CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setHolidayModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Public Holiday
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>{h.name}</span>
                  </div>
                  <Badge variant="secondary">{h.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create HR Modal */}
      <Modal
        isOpen={hrModalOpen}
        onClose={() => setHrModalOpen(false)}
        title="Create HR Account"
        description="Creates an HR role login. HR can register employees, review attendance, and run payroll drafts."
      >
        <form onSubmit={handleCreateHR} className="space-y-4 text-xs">
          {hrMsg && <div className="text-rose-600 bg-rose-50 p-2 rounded">{hrMsg}</div>}
          <div>
            <label className="font-semibold text-slate-600">HR Email</label>
            <Input
              type="email"
              value={hrEmail}
              onChange={(e) => setHrEmail(e.target.value)}
              placeholder="hr@company.com"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600">Password</label>
            <Input
              type="password"
              value={hrPassword}
              onChange={(e) => setHrPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create HR Account
          </Button>
        </form>
      </Modal>

      {/* Add Dept Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title="Add Department"
      >
        <form onSubmit={handleAddDept} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Department Name</label>
            <Input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Finance"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600">Code</label>
            <Input
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              placeholder="e.g. FIN"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600">Description</label>
            <Input
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              placeholder="Financial planning & accounting"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Department
          </Button>
        </form>
      </Modal>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        title="Add Public Holiday"
      >
        <form onSubmit={handleAddHoliday} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Holiday Name</label>
            <Input
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Eid-ul-Fitr"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600">Date</label>
            <Input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Holiday
          </Button>
        </form>
      </Modal>
    </div>
  );
}
