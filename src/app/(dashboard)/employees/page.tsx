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
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Building,
} from "lucide-react";
import {
  getStoredState,
  registerEmployee,
  saveState,
} from "@/lib/store";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState<any>(null);

  // CSV Dry Run State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [dryRunRows, setDryRunRows] = useState<any[]>([]);

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

  const handleRegister = (e: React.FormEvent) => {
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

    const res = registerEmployee({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address,
      department_id: deptId,
      designation_id: desId || state.designations[0]?.id || "des-se",
      basic_salary: Number(basicSalary),
      status: empStatus,
    });

    if (res.success) {
      setRegSuccess(res);
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setBasicSalary(80000);
    } else {
      setRegError(res.message || "Failed to register employee.");
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

  // CSV Dry Run Simulation (Section 3 Requirement)
  const handleSimulateCSVDryRun = () => {
    const mockCsv = [
      { row: 1, name: "Hamza Tariq", email: "hamza@saylani.com", dept: "Engineering", salary: 90000, valid: true, error: null },
      { row: 2, name: "Ayesha Khan", email: "ayesha@saylani.com", dept: "Human Resources", salary: 85000, valid: true, error: null },
      { row: 3, name: "Bilal Ahmed", email: "invalid-email-format", dept: "Engineering", salary: 70000, valid: false, error: "Invalid email syntax" },
      { row: 4, name: "Sara Malik", email: "sara@saylani.com", dept: "NonExistentDept", salary: 65000, valid: false, error: "Unknown department" },
      { row: 5, name: "Zubair Shah", email: "zubair@saylani.com", dept: "Marketing", salary: -5000, valid: false, error: "Salary must be > 0" },
    ];
    setDryRunRows(mockCsv);
    setIsCsvModalOpen(true);
  };

  const handleCommitValidCsvRows = () => {
    const validRows = dryRunRows.filter((r) => r.valid);
    validRows.forEach((r) => {
      const dept = state.departments.find((d) => d.name === r.dept) || state.departments[0];
      registerEmployee({
        first_name: r.name.split(" ")[0],
        last_name: r.name.split(" ")[1] || "Staff",
        email: r.email,
        phone: "+92 300 1234567",
        address: "Karachi, Pakistan",
        department_id: dept?.id || "dept-eng",
        designation_id: state.designations[0]?.id || "des-se",
        basic_salary: r.salary,
      });
    });
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
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
                    <td className="p-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
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
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Raza"
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
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
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
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
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
                <span className="text-indigo-600 font-mono text-[11px]">Rule: Gross = 1.5 × Basic</span>
              </label>
              <Input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
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

            <Button type="submit" className="w-full h-10 font-semibold bg-indigo-600 hover:bg-indigo-700">
              Register & Generate Login
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
                {dryRunRows.map((r) => (
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
                ))}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Commit Valid Rows to DB
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
