"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  Loader2,
  Lock,
} from "lucide-react";
import {
  getStoredState,
  registerEmployeeAsync,
  importEmployeesCSVAsync,
  saveState,
} from "@/lib/store";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function EmployeesPage() {
  const [state, setState] = useState(getStoredState());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deptId, setDeptId] = useState("");
  const [desId, setDesId] = useState("");
  const [basicSalary, setBasicSalary] = useState(80000);
  const [empStatus, setEmpStatus] = useState<Employee["status"]>("active");
  const [customPassword, setCustomPassword] = useState("");
  const [showCustomPassword, setShowCustomPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState<any>(null);

  // CSV Dry Run State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [dryRunRows, setDryRunRows] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    const handleState = () => setState(getStoredState());
    window.addEventListener("hcm_state_changed", handleState);
    return () => window.removeEventListener("hcm_state_changed", handleState);
  }, []);

  const role = state.currentUser?.role;
  const canManage = role === "hr" || role === "admin";

  // Filtered employees
  const filtered = state.employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || emp.department_id === filterDept;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!deptId) {
      setRegError("Please select a department.");
      return;
    }
    if (basicSalary <= 0) {
      setRegError("Basic salary must be greater than zero.");
      return;
    }

    setIsRegistering(true);
    try {
      const res = await registerEmployeeAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        department_id: deptId,
        designation_id: desId || state.designations[0]?.id || "des-se",
        basic_salary: Number(basicSalary),
        status: empStatus,
        password: customPassword ? customPassword.trim() : undefined,
      });

      if (res.success) {
        setRegSuccess(res);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setBasicSalary(80000);
        setCustomPassword("");
        setShowCustomPassword(false);
      } else {
        setRegError(res.message || "Failed to register employee.");
      }
    } catch (err: any) {
      setRegError(err?.message || "An unexpected error occurred while registering employee.");
    } finally {
      setIsRegistering(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "EmployeeCode",
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "Department",
      "Designation",
      "BasicSalary",
      "GrossSalary",
      "Status",
    ];
    const rows = filtered.map((e) => [
      e.employee_code,
      e.first_name,
      e.last_name,
      e.email,
      e.phone,
      e.department_name,
      e.designation_title,
      e.basic_salary,
      e.salary_structure?.gross_salary,
      e.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Dry Run (Real Backend Validation + Demo Sample Support)
  const sampleCsvString = [
    "fullName,email,phone,department,designation,joiningDate,grossSalary",
    `Hamza Tariq,hamza.${Date.now().toString().slice(-4)}@saylani.com,+923001112233,${state.departments[0]?.name || "Engineering"},Software Engineer,2026-01-15,135000`,
    `Ayesha Khan,ayesha.${Date.now().toString().slice(-4)}@saylani.com,+923004445566,${state.departments[0]?.name || "Engineering"},Product Designer,2026-02-01,127500`,
    "Bilal Ahmed,invalid-email-format,+923007778899,Engineering,QA Engineer,2026-03-01,105000",
    "Zubair Shah,zubair@saylani.com,+923009990011,Engineering,DevOps,-5000",
  ].join("\n");

  const handleSimulateCSVDryRun = async () => {
    setIsCsvModalOpen(true);
    setCsvLoading(true);
    setCsvFile(sampleCsvString);
    const res = await importEmployeesCSVAsync(sampleCsvString, true);
    setCsvLoading(false);
    if (res.success && res.rows.length > 0) {
      setDryRunRows(res.rows);
    }
  };

  const handleFileUploadDryRun = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvLoading(true);
    const res = await importEmployeesCSVAsync(file, true);
    setCsvLoading(false);
    if (res.success) {
      setDryRunRows(res.rows);
    }
  };

  const handleCommitValidCsvRows = async () => {
    if (!csvFile) return;
    setCsvLoading(true);
    await importEmployeesCSVAsync(csvFile, false);
    setCsvLoading(false);
    setIsCsvModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Directory & 360 (M3)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register employees, manage compensation structures, and dry-run CSV imports.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateCSVDryRun}
              className="text-xs"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              CSV Dry-Run Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setRegSuccess(null);
                setIsRegisterOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Register Employee
            </Button>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="h-9 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {state.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Employee Name</th>
                  <th className="p-3.5">Department & Role</th>
                  <th className="p-3.5">Basic Salary</th>
                  <th className="p-3.5">Gross (1.5x)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {emp.employee_code}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div className="text-slate-400 text-[11px]">{emp.email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {emp.department_name}
                      </div>
                      <div className="text-slate-400 text-[11px]">{emp.designation_title}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(emp.basic_salary)}
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(emp.salary_structure?.gross_salary || emp.basic_salary * 1.5)}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          emp.status === "active"
                            ? "success"
                            : emp.status === "probation"
                            ? "warning"
                            : "secondary"
                        }
                        className="capitalize text-[10px]"
                      >
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View 360
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No employees found. Click "Register Employee" above to add staff!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* REGISTER EMPLOYEE MODAL (M3 & M6) */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Employee"
        description="Creates employee profile, generates login account with temporary password, and calculates salary structure."
        maxWidth="max-w-xl"
      >
        {regSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle className="h-5 w-5" />
              <span>Employee Registered Successfully!</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              An account was created for <strong>{regSuccess.employee.first_name} {regSuccess.employee.last_name}</strong> ({regSuccess.employee.employee_code}).
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
              <div><strong>Login Email:</strong> {regSuccess.loginEmail}</div>
              <div><strong>Temporary Password:</strong> {regSuccess.tempPassword}</div>
              <div className="text-amber-600 text-[10px] mt-1">* Employee will be forced to change password on first login.</div>
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => {
                setRegSuccess(null);
                setIsRegisterOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {regError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">{regError}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ali"
                  disabled={isRegistering}
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Raza"
                  disabled={isRegistering}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600">Official Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali.raza@company.com"
                  disabled={isRegistering}
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  disabled={isRegistering}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600">Residential Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gulshan-e-Iqbal, Karachi"
                disabled={isRegistering}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  disabled={isRegistering}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 disabled:opacity-60"
                  required
                >
                  <option value="">Select Department</option>
                  {state.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600">Employment Status</label>
                <select
                  value={empStatus}
                  onChange={(e) => setEmpStatus(e.target.value as any)}
                  disabled={isRegistering}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 disabled:opacity-60"
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                </select>
              </div>
            </div>

            {/* Salary Calculation Preview (Section 3 & 6) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Basic Salary (PKR)</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono text-[11px]">Rule: Gross = 1.5 × Basic</span>
              </label>
              <Input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                disabled={isRegistering}
                required
              />

              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400">HRA (40%):</span>
                  <div className="font-semibold">{formatCurrency(Math.round(basicSalary * 0.4))}</div>
                </div>
                <div>
                  <span className="text-slate-400">Medical (10%):</span>
                  <div className="font-semibold">{formatCurrency(Math.round(basicSalary * 0.1))}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-emerald-600">Gross Salary:</span>
                  <div className="font-bold text-emerald-600">{formatCurrency(Math.round(basicSalary * 1.5))}</div>
                </div>
              </div>
            </div>

            {/* Temporary / Login Password with Show Password Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Temporary Password (Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Leave empty to auto-generate
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showCustomPassword ? "text" : "password"}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="e.g. Welcome@2026 or leave blank"
                  disabled={isRegistering}
                  className="pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomPassword(!showCustomPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 rounded cursor-pointer"
                  aria-label={showCustomPassword ? "Hide password" : "Show password"}
                  title={showCustomPassword ? "Hide password" : "Show password"}
                >
                  {showCustomPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Clear Loading Feedback Banner */}
            {isRegistering && (
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-bold">Registering Employee... Please wait</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-300">
                    Creating profile in MongoDB, setting compensation, and sending welcome email...
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isRegistering}
              className="w-full h-10 font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Registering Employee... Please wait</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Register & Generate Login</span>
                </>
              )}
            </Button>
          </form>
        )}
      </Modal>

      {/* CSV DRY-RUN MODAL (Section 3 Requirement) */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="CSV Import Dry-Run Report (M3)"
        description="Inspects every row for valid email, known dept, and positive salary before committing to database."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Upload Custom CSV File (or use loaded sample)
              </div>
              <div className="text-[10px] text-slate-400">
                Columns: fullName, email, phone, department, designation, joiningDate, grossSalary
              </div>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUploadDryRun}
              className="text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Candidate Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Dept</th>
                  <th className="p-2.5">Salary</th>
                  <th className="p-2.5">Validation Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {csvLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-2.5"><Skeleton className="h-3.5 w-6" /></td>
                      <td className="p-2.5"><Skeleton className="h-3.5 w-24" /></td>
                      <td className="p-2.5"><Skeleton className="h-3.5 w-32" /></td>
                      <td className="p-2.5"><Skeleton className="h-3.5 w-16" /></td>
                      <td className="p-2.5"><Skeleton className="h-3.5 w-20" /></td>
                      <td className="p-2.5"><Skeleton className="h-4 w-20 rounded-full" /></td>
                    </tr>
                  ))
                ) : (
                  dryRunRows.map((r) => (
                    <tr key={r.row} className={r.valid ? "" : "bg-rose-50/50 dark:bg-rose-950/20"}>
                      <td className="p-2.5 font-mono">{r.row}</td>
                      <td className="p-2.5 font-medium">{r.name}</td>
                      <td className="p-2.5">{r.email}</td>
                      <td className="p-2.5">{r.dept}</td>
                      <td className="p-2.5">{formatCurrency(r.salary)}</td>
                      <td className="p-2.5">
                        {r.valid ? (
                          <Badge variant="success">Pass (Ready)</Badge>
                        ) : (
                          <Badge variant="destructive">{r.error}</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500 text-[11px]">
              Ready to import {dryRunRows.filter((r) => r.valid).length} valid rows. {dryRunRows.filter((r) => !r.valid).length} errors skipped.
            </span>
            <Button
              size="sm"
              onClick={handleCommitValidCsvRows}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Commit Valid Rows to DB
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
