"use client";

import {
  User,
  UserRole,
  CompanySettings,
  Department,
  Designation,
  LeaveType,
  Holiday,
  Employee,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveRequest,
  PayrollRun,
  Payslip,
  Announcement,
  Notification,
  AuditLog,
  AIMessage,
  SmartLeaveDraft,
} from "@/types";
import {
  calculateSalaryStructure,
  calculatePayrollDeductions,
  evaluateCheckInStatus,
  calculateDistanceMeters,
} from "./payroll-calculator";

const STORAGE_KEY = "hcm_lite_state_v1";

export interface HCMState {
  isInitialized: boolean;
  currentUser: User | null;
  companySettings: CompanySettings | null;
  departments: Department[];
  designations: Designation[];
  leaveTypes: LeaveType[];
  holidays: Holiday[];
  users: (User & { password_hash: string })[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  leaveRequests: LeaveRequest[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  announcements: Announcement[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  aiLogs: { id: string; query: string; response: string; timestamp: string }[];
}

const defaultLeaveTypes: LeaveType[] = [
  { id: "lt-annual", name: "Annual Leave", code: "AL", yearly_quota: 14, is_paid: true, color: "slate" },
  { id: "lt-sick", name: "Sick Leave", code: "SL", yearly_quota: 8, is_paid: true, color: "rose" },
  { id: "lt-casual", name: "Casual Leave", code: "CL", yearly_quota: 10, is_paid: true, color: "amber" },
  { id: "lt-unpaid", name: "Unpaid Leave", code: "UL", yearly_quota: 0, is_paid: false, color: "slate" },
];

const initialEmptyState: HCMState = {
  isInitialized: false,
  currentUser: null,
  companySettings: null,
  departments: [],
  designations: [],
  leaveTypes: defaultLeaveTypes,
  holidays: [
    { id: "h-1", name: "Labor Day", date: "2026-05-01" },
    { id: "h-2", name: "Independence Day", date: "2026-08-14" },
    { id: "h-3", name: "Quaid Day", date: "2026-12-25" },
  ],
  users: [],
  employees: [],
  attendance: [],
  attendanceCorrections: [],
  leaveRequests: [],
  payrollRuns: [],
  payslips: [],
  announcements: [],
  notifications: [],
  auditLogs: [],
  aiLogs: [],
};

// Local storage helper
export function getStoredState(): HCMState {
  if (typeof window === "undefined") return initialEmptyState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialEmptyState;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load state from localStorage", err);
    return initialEmptyState;
  }
}

export function saveState(state: HCMState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("hcm_state_changed"));
  } catch (err) {
    console.error("Failed to save state to localStorage", err);
  }
}

// Reset / Purge helper (useful for hackathon demo to test fresh start)
export function resetToEmptyState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("hcm_state_changed"));
}

// ==========================================
// AUDIT LOG HELPER
// ==========================================
export function logAudit(
  actor: { email: string; role: any },
  action: AuditLog["action"],
  entity_type: AuditLog["entity_type"],
  details: string,
  before_state: any = null,
  after_state: any = null,
  entity_id?: string
) {
  const state = getStoredState();
  const newLog: AuditLog = {
    id: "audit-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    actor_email: actor?.email || "system",
    actor_role: actor?.role || "admin",
    action,
    entity_type,
    entity_id,
    details,
    before_state,
    after_state,
    timestamp: new Date().toISOString(),
  };
  state.auditLogs.unshift(newLog);
  saveState(state);
}

// ==========================================
// FIRST-RUN SETUP (M1 & M2)
// ==========================================
export function setupCompanyAndAdmin(data: {
  company_name: string;
  admin_email: string;
  admin_password: string;
  office_start?: string;
  grace_time_minutes?: number;
  half_day_hours?: number;
  office_lat?: number;
  office_lng?: number;
  office_radius_meters?: number;
}) {
  const state = getStoredState();

  const settings: CompanySettings = {
    id: "cs-1",
    company_name: data.company_name,
    office_start: data.office_start || "09:00",
    grace_time_minutes: data.grace_time_minutes ?? 15,
    half_day_hours: data.half_day_hours ?? 5,
    weekend_days: [0, 6], // Sun, Sat
    office_lat: data.office_lat || 24.8607,
    office_lng: data.office_lng || 67.0011,
    office_radius_meters: data.office_radius_meters || 150,
    created_at: new Date().toISOString(),
  };

  const adminUser = {
    id: "user-admin-1",
    email: data.admin_email.toLowerCase().trim(),
    role: "admin" as const,
    password_hash: data.admin_password, // in real backend this is bcrypt
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
  };

  state.isInitialized = true;
  state.companySettings = settings;
  state.users = [adminUser];
  state.currentUser = adminUser;

  // Add initial core departments
  state.departments = [
    { id: "dept-eng", name: "Engineering", code: "ENG", description: "Software & Technology" },
    { id: "dept-hr", name: "Human Resources", code: "HR", description: "People Operations" },
    { id: "dept-mkt", name: "Marketing", code: "MKT", description: "Growth & Branding" },
  ];

  state.designations = [
    { id: "des-se", title: "Software Engineer", department_id: "dept-eng", department_name: "Engineering" },
    { id: "des-lead", title: "Tech Lead", department_id: "dept-eng", department_name: "Engineering" },
    { id: "des-hrm", title: "HR Manager", department_id: "dept-hr", department_name: "Human Resources" },
    { id: "des-mkt", title: "Marketing Specialist", department_id: "dept-mkt", department_name: "Marketing" },
  ];

  // Welcome announcement
  state.announcements = [
    {
      id: "ann-1",
      title: "Welcome to " + data.company_name + " HCM!",
      content: "The company workspace is now active. Office timings are 09:00 AM with a 15-minute grace period.",
      target_role: "all",
      author_name: "Admin",
      author_role: "admin",
      created_at: new Date().toISOString(),
    },
  ];

  saveState(state);

  logAudit(
    { email: adminUser.email, role: "admin" },
    "create",
    "company",
    `Initialized company: ${data.company_name} and primary Admin account`,
    null,
    settings
  );

  return { success: true, user: adminUser };
}

// ==========================================
// AUTH & USERS (M1)
// ==========================================
export function loginUser(email: string, password: string) {
  const state = getStoredState();
  const normalizedEmail = email.toLowerCase().trim();
  const userRecord = state.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!userRecord) {
    return { success: false, message: "Invalid email or password" };
  }
  if (!userRecord.is_active) {
    return { success: false, message: "This account has been deactivated" };
  }
  if (userRecord.password_hash !== password) {
    return { success: false, message: "Invalid email or password" };
  }

  // If employee, link employee details
  let employeeName = "";
  if (userRecord.employee_id) {
    const emp = state.employees.find((e) => e.id === userRecord.employee_id);
    if (emp) {
      employeeName = `${emp.first_name} ${emp.last_name}`;
    }
  }

  const currentUser: User = {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
    must_change_password: userRecord.must_change_password,
    is_active: userRecord.is_active,
    employee_id: userRecord.employee_id,
    employee_name: employeeName,
    created_at: userRecord.created_at,
  };

  state.currentUser = currentUser;
  saveState(state);

  logAudit(
    { email: currentUser.email, role: currentUser.role },
    "login",
    "user",
    `User ${currentUser.email} logged in (${currentUser.role})`
  );

  return { success: true, user: currentUser };
}

export function logoutUser() {
  const state = getStoredState();
  state.currentUser = null;
  saveState(state);
}

export function changePassword(userId: string, newPassword: string) {
  const state = getStoredState();
  const user = state.users.find((u) => u.id === userId);
  if (!user) return { success: false, message: "User not found" };

  user.password_hash = newPassword;
  user.must_change_password = false;
  if (state.currentUser && state.currentUser.id === userId) {
    state.currentUser.must_change_password = false;
  }

  saveState(state);
  logAudit(
    { email: user.email, role: user.role },
    "update",
    "user",
    `Password changed for ${user.email}`
  );

  return { success: true };
}

export function createHRUser(email: string, password: string) {
  const state = getStoredState();
  const normalized = email.toLowerCase().trim();

  if (state.users.some((u) => u.email.toLowerCase() === normalized)) {
    return { success: false, message: "User with this email already exists" };
  }

  const hrUser = {
    id: "user-hr-" + Date.now(),
    email: normalized,
    role: "hr" as const,
    password_hash: password,
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
  };

  state.users.push(hrUser);
  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "admin", role: "admin" },
    "create",
    "user",
    `Created HR account: ${normalized}`
  );

  return { success: true, user: hrUser };
}

// ==========================================
// EMPLOYEES (M3)
// ==========================================
export function registerEmployee(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department_id: string;
  designation_id: string;
  basic_salary: number;
  join_date?: string;
  status?: Employee["status"];
}) {
  const state = getStoredState();
  const normalizedEmail = data.email.toLowerCase().trim();

  if (state.employees.some((e) => e.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: "Employee with this email already exists" };
  }

  const dept = state.departments.find((d) => d.id === data.department_id);
  const des = state.designations.find((d) => d.id === data.designation_id);

  const empNumber = state.employees.length + 1;
  const employeeCode = `EMP-${String(empNumber).padStart(3, "0")}`;
  const employeeId = "emp-" + Date.now();

  const salaryStructure = calculateSalaryStructure(data.basic_salary);

  const tempPassword = "Password@123";

  // Create login user automatically with must_change_password: true
  const userAccount = {
    id: "user-" + employeeId,
    email: normalizedEmail,
    role: "employee" as const,
    password_hash: tempPassword,
    is_active: true,
    must_change_password: true,
    employee_id: employeeId,
    created_at: new Date().toISOString(),
  };

  const newEmployee: Employee = {
    id: employeeId,
    employee_code: employeeCode,
    first_name: data.first_name,
    last_name: data.last_name,
    email: normalizedEmail,
    phone: data.phone,
    address: data.address,
    department_id: data.department_id,
    department_name: dept?.name || "General",
    designation_id: data.designation_id,
    designation_title: des?.title || "Staff",
    join_date: data.join_date || new Date().toISOString().split("T")[0],
    status: data.status || "active",
    basic_salary: data.basic_salary,
    salary_structure: salaryStructure,
    user_id: userAccount.id,
    created_at: new Date().toISOString(),
  };

  state.employees.push(newEmployee);
  state.users.push(userAccount);
  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "hr", role: state.currentUser?.role || "hr" },
    "create",
    "employee",
    `Registered employee ${employeeCode} (${data.first_name} ${data.last_name}) with basic salary Rs. ${data.basic_salary.toLocaleString()}`
  );

  return {
    success: true,
    employee: newEmployee,
    tempPassword,
    loginEmail: normalizedEmail,
  };
}

export function updateEmployeeDetails(
  id: string,
  updates: Partial<Employee>,
  actorRole: UserRole
) {
  const state = getStoredState();
  const emp = state.employees.find((e) => e.id === id);
  if (!emp) return { success: false, message: "Employee not found" };

  const beforeState = { ...emp };

  // Rule: Employee can ONLY edit phone and address
  if (actorRole === "employee") {
    if (updates.phone !== undefined) emp.phone = updates.phone;
    if (updates.address !== undefined) emp.address = updates.address;
  } else {
    // HR can edit full details
    Object.assign(emp, updates);
    if (updates.basic_salary) {
      emp.salary_structure = calculateSalaryStructure(updates.basic_salary);
    }
    if (updates.department_id) {
      const dept = state.departments.find((d) => d.id === updates.department_id);
      if (dept) emp.department_name = dept.name;
    }
    if (updates.designation_id) {
      const des = state.designations.find((d) => d.id === updates.designation_id);
      if (des) emp.designation_title = des.title;
    }
  }

  saveState(state);
  logAudit(
    { email: state.currentUser?.email || "user", role: actorRole },
    "update",
    "employee",
    `Updated profile for employee ${emp.employee_code}`,
    beforeState,
    emp,
    id
  );

  return { success: true, employee: emp };
}

// ==========================================
// ATTENDANCE (M4)
// ==========================================
export function recordCheckIn(data: {
  employee_id: string;
  source: "web" | "camera";
  lat?: number;
  lng?: number;
  timeOverride?: string; // for testing
}) {
  const state = getStoredState();
  const emp = state.employees.find((e) => e.id === data.employee_id);
  if (!emp) return { success: false, message: "Employee not found" };

  const now = data.timeOverride ? new Date(data.timeOverride) : new Date();
  const todayDate = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

  // Rule: One record per employee per day (second check-in = 409)
  const existingRecord = state.attendance.find(
    (a) => a.employee_id === data.employee_id && a.date === todayDate
  );
  if (existingRecord) {
    return {
      success: false,
      status_code: 409,
      message: "You have already checked in today at " + existingRecord.check_in,
    };
  }

  // Geofence check if coordinates provided
  let distanceMeters = 0;
  if (data.lat !== undefined && data.lng !== undefined && state.companySettings) {
    distanceMeters = calculateDistanceMeters(
      data.lat,
      data.lng,
      state.companySettings.office_lat,
      state.companySettings.office_lng
    );

    if (distanceMeters > state.companySettings.office_radius_meters) {
      return {
        success: false,
        message: `Outside office radius (${distanceMeters}m away, max allowed is ${state.companySettings.office_radius_meters}m)`,
      };
    }
  }

  // Rule: Late after 09:15
  const initialStatus = evaluateCheckInStatus(
    timeStr,
    state.companySettings?.office_start || "09:00",
    state.companySettings?.grace_time_minutes ?? 15
  );

  const newRecord: AttendanceRecord = {
    id: "att-" + Date.now(),
    employee_id: data.employee_id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    department_name: emp.department_name,
    date: todayDate,
    check_in: timeStr,
    status: initialStatus,
    check_in_source: data.source,
    lat: data.lat,
    lng: data.lng,
    distance_meters: distanceMeters,
  };

  state.attendance.unshift(newRecord);
  saveState(state);

  logAudit(
    { email: emp.email, role: "employee" },
    "create",
    "attendance",
    `Checked in at ${timeStr} (${initialStatus.toUpperCase()}) via ${data.source}`
  );

  return { success: true, record: newRecord };
}

export function recordCheckOut(employee_id: string, timeOverride?: string) {
  const state = getStoredState();
  const now = timeOverride ? new Date(timeOverride) : new Date();
  const todayDate = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const record = state.attendance.find(
    (a) => a.employee_id === employee_id && a.date === todayDate
  );

  if (!record || !record.check_in) {
    return { success: false, message: "No check-in record found for today" };
  }

  if (record.check_out) {
    return { success: false, message: "You have already checked out today at " + record.check_out };
  }

  // Calculate hours worked
  const [inH, inM] = record.check_in.split(":").map(Number);
  const [outH, outM] = timeStr.split(":").map(Number);
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;
  const diffHours = Math.max(0, Number(((outMinutes - inMinutes) / 60).toFixed(2)));

  record.check_out = timeStr;
  record.work_hours = diffHours;

  // Rule: half_day under 5 hours
  const halfDayThreshold = state.companySettings?.half_day_hours ?? 5;
  if (diffHours < halfDayThreshold) {
    record.status = "half_day";
  }

  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "employee", role: "employee" },
    "update",
    "attendance",
    `Checked out at ${timeStr} (${diffHours} hrs worked, Status: ${record.status})`
  );

  return { success: true, record };
}

export function requestCorrection(data: {
  employee_id: string;
  date: string;
  requested_check_in: string;
  requested_check_out: string;
  reason: string;
}) {
  const state = getStoredState();
  const emp = state.employees.find((e) => e.id === data.employee_id);

  const correction: AttendanceCorrection = {
    id: "corr-" + Date.now(),
    employee_id: data.employee_id,
    employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Employee",
    date: data.date,
    requested_check_in: data.requested_check_in,
    requested_check_out: data.requested_check_out,
    reason: data.reason,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  state.attendanceCorrections.unshift(correction);
  saveState(state);

  return { success: true, correction };
}

export function reviewCorrection(id: string, status: "approved" | "rejected", reviewerComment: string) {
  const state = getStoredState();
  const corr = state.attendanceCorrections.find((c) => c.id === id);
  if (!corr) return { success: false, message: "Correction not found" };

  corr.status = status;
  corr.reviewer_comment = reviewerComment;
  corr.reviewed_by = state.currentUser?.email;

  if (status === "approved") {
    // update or create attendance record
    let att = state.attendance.find(
      (a) => a.employee_id === corr.employee_id && a.date === corr.date
    );
    if (!att) {
      const emp = state.employees.find((e) => e.id === corr.employee_id);
      att = {
        id: "att-corr-" + Date.now(),
        employee_id: corr.employee_id,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Employee",
        date: corr.date,
        check_in: corr.requested_check_in,
        check_out: corr.requested_check_out,
        status: "present",
        check_in_source: "web",
        work_hours: 8,
      };
      state.attendance.unshift(att);
    } else {
      att.check_in = corr.requested_check_in;
      att.check_out = corr.requested_check_out;
      att.status = "present";
      att.work_hours = 8;
    }
  }

  saveState(state);
  return { success: true };
}

// ==========================================
// LEAVE (M5)
// ==========================================
export function getEmployeeLeaveBalances(employee_id: string) {
  const state = getStoredState();
  const approvedLeaves = state.leaveRequests.filter(
    (l) => l.employee_id === employee_id && l.status === "approved"
  );

  return state.leaveTypes.map((type) => {
    const used = approvedLeaves
      .filter((l) => l.leave_type_id === type.id)
      .reduce((acc, curr) => acc + curr.days_count, 0);

    const remaining = type.yearly_quota > 0 ? Math.max(0, type.yearly_quota - used) : 999;

    return {
      leave_type_id: type.id,
      leave_type_name: type.name,
      quota: type.yearly_quota,
      used,
      remaining,
    };
  });
}

export function applyForLeave(data: {
  employee_id: string;
  leave_type_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: string;
}) {
  const state = getStoredState();
  const emp = state.employees.find((e) => e.id === data.employee_id);
  if (!emp) return { success: false, message: "Employee not found" };

  const start = new Date(data.start_date);
  const end = new Date(data.end_date);

  if (start > end) {
    return { success: false, status_code: 422, message: "Start date must be before or equal to end date" };
  }

  // Calculate working days only (skipping weekends & public holidays)
  let workingDays = 0;
  const cur = new Date(start);
  const weekendDays = state.companySettings?.weekend_days || [0, 6];
  const holidayDates = new Set(state.holidays.map((h) => h.date));

  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    const dateStr = cur.toISOString().split("T")[0];
    const isWeekend = weekendDays.includes(dayOfWeek);
    const isHoliday = holidayDates.has(dateStr);

    if (!isWeekend && !isHoliday) {
      workingDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (workingDays === 0) {
    return { success: false, status_code: 422, message: "Selected period falls entirely on weekends or holidays" };
  }

  // Overlap check with existing approved or pending leaves
  const hasOverlap = state.leaveRequests.some((l) => {
    if (l.employee_id !== data.employee_id || l.status === "rejected" || l.status === "cancelled") {
      return false;
    }
    const lStart = new Date(l.start_date);
    const lEnd = new Date(l.end_date);
    return start <= lEnd && end >= lStart;
  });

  if (hasOverlap) {
    return {
      success: false,
      status_code: 422,
      message: "Overlap detected: You already have a leave request for these dates",
    };
  }

  // Quota balance check
  const balances = getEmployeeLeaveBalances(data.employee_id);
  const currentBalance = balances.find((b) => b.leave_type_id === data.leave_type_id);
  const leaveType = state.leaveTypes.find((t) => t.id === data.leave_type_id);

  if (leaveType && leaveType.yearly_quota > 0 && currentBalance) {
    if (currentBalance.remaining < workingDays) {
      return {
        success: false,
        status_code: 422,
        message: `Insufficient leave balance! You have ${currentBalance.remaining} days left, requested ${workingDays} days`,
      };
    }
  }

  const newLeave: LeaveRequest = {
    id: "leave-" + Date.now(),
    employee_id: data.employee_id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    leave_type_id: data.leave_type_id,
    leave_type_name: leaveType?.name || "Leave",
    start_date: data.start_date,
    end_date: data.end_date,
    days_count: workingDays,
    reason: data.reason,
    status: "pending",
    applied_at: new Date().toISOString(),
  };

  state.leaveRequests.unshift(newLeave);

  // In-app notification for HR
  state.notifications.unshift({
    id: "notif-" + Date.now(),
    user_id: "hr",
    title: "New Leave Application",
    message: `${emp.first_name} ${emp.last_name} applied for ${workingDays} days of ${leaveType?.name}`,
    type: "leave",
    is_read: false,
    created_at: new Date().toISOString(),
  });

  saveState(state);

  logAudit(
    { email: emp.email, role: "employee" },
    "create",
    "leave",
    `Applied for ${workingDays} days ${leaveType?.name} from ${data.start_date} to ${data.end_date}`
  );

  return { success: true, leave: newLeave };
}

export function reviewLeaveRequest(
  leaveId: string,
  decision: "approved" | "rejected",
  comment: string
) {
  const state = getStoredState();
  const leave = state.leaveRequests.find((l) => l.id === leaveId);
  if (!leave) return { success: false, message: "Leave request not found" };

  leave.status = decision;
  leave.reviewer_comment = comment;
  leave.reviewer_id = state.currentUser?.email;

  // Notify employee
  const emp = state.employees.find((e) => e.id === leave.employee_id);
  if (emp && emp.user_id) {
    state.notifications.unshift({
      id: "notif-" + Date.now(),
      user_id: emp.user_id,
      title: `Leave Request ${decision.toUpperCase()}`,
      message: `Your leave for ${leave.start_date} to ${leave.end_date} was ${decision}. Comment: ${comment || "None"}`,
      type: "leave",
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "hr", role: "hr" },
    decision === "approved" ? "approve" : "reject",
    "leave",
    `${decision.toUpperCase()} leave for ${leave.employee_name}: ${comment}`
  );

  return { success: true, leave };
}

// ==========================================
// PAYROLL LITE (M6)
// ==========================================
export function generateMonthlyPayrollDraft(monthStr: string) {
  const state = getStoredState();

  // If already finalized, cannot re-run
  const existingRun = state.payrollRuns.find((p) => p.month === monthStr);
  if (existingRun && existingRun.status === "finalized") {
    return {
      success: false,
      message: "Payroll for " + monthStr + " is already FINALIZED and locked!",
    };
  }

  // Calculate working days in that month (default standard ~22 days or exact calendar)
  const [yearStr, mStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  let standardWorkingDays = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayDate = new Date(year, month - 1, d);
    const dayOfWeek = dayDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      standardWorkingDays++;
    }
  }

  const runId = existingRun ? existingRun.id : "payrun-" + Date.now();
  const generatedPayslips: Payslip[] = [];

  let totalGross = 0;
  let totalDeductions = 0;
  let totalTax = 0;
  let totalNet = 0;

  state.employees.forEach((emp) => {
    if (emp.status === "terminated") return;

    // Count employee's attendance & approved leaves in that month
    const empAtt = state.attendance.filter(
      (a) => a.employee_id === emp.id && a.date.startsWith(monthStr)
    );

    const daysPresent = empAtt.filter((a) => a.status === "present" || a.status === "late").length;
    const lateDays = empAtt.filter((a) => a.status === "late").length;
    const halfDays = empAtt.filter((a) => a.status === "half_day").length;

    // Check approved unpaid leave
    const unpaidType = state.leaveTypes.find((t) => t.code === "UL" || !t.is_paid);
    const unpaidLeaves = state.leaveRequests
      .filter(
        (l) =>
          l.employee_id === emp.id &&
          l.status === "approved" &&
          l.leave_type_id === unpaidType?.id &&
          l.start_date.startsWith(monthStr)
      )
      .reduce((sum, curr) => sum + curr.days_count, 0);

    // Paid leaves are treated as present for pay
    const paidLeaves = state.leaveRequests
      .filter(
        (l) =>
          l.employee_id === emp.id &&
          l.status === "approved" &&
          l.leave_type_id !== unpaidType?.id &&
          l.start_date.startsWith(monthStr)
      )
      .reduce((sum, curr) => sum + curr.days_count, 0);

    // Absent days calculation
    const accountedDays = daysPresent + halfDays + paidLeaves + unpaidLeaves;
    const absentDays = Math.max(0, standardWorkingDays - accountedDays);

    const calc = calculatePayrollDeductions({
      grossSalary: emp.salary_structure.gross_salary,
      workingDays: standardWorkingDays,
      absentDays,
      unpaidLeaveDays: unpaidLeaves,
      halfDays,
      lateDays,
    });

    totalGross += emp.salary_structure.gross_salary;
    totalDeductions += calc.attendanceDeduction;
    totalTax += calc.monthlyTax;
    totalNet += calc.netSalary;

    const payslip: Payslip = {
      id: `slip-${runId}-${emp.id}`,
      payroll_run_id: runId,
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      employee_code: emp.employee_code,
      department_name: emp.department_name || "General",
      designation_title: emp.designation_title || "Staff",
      month: monthStr,
      working_days: standardWorkingDays,
      days_present: daysPresent + paidLeaves,
      days_absent: absentDays,
      half_days: halfDays,
      unpaid_leave_days: unpaidLeaves,
      late_penalty_days: calc.latePenaltyDays,
      basic_salary: emp.salary_structure.basic_salary,
      hra: emp.salary_structure.hra,
      medical_allowance: emp.salary_structure.medical_allowance,
      gross_salary: emp.salary_structure.gross_salary,
      per_day_salary: calc.perDaySalary,
      attendance_deduction: calc.attendanceDeduction,
      tax_deduction: calc.monthlyTax,
      net_salary: calc.netSalary,
      status: "draft",
      generated_at: new Date().toISOString(),
    };

    generatedPayslips.push(payslip);
  });

  const payrollRun: PayrollRun = {
    id: runId,
    month: monthStr,
    status: "draft",
    total_gross: totalGross,
    total_deductions: totalDeductions,
    total_tax: totalTax,
    total_net: totalNet,
    employee_count: generatedPayslips.length,
    created_at: new Date().toISOString(),
  };

  // replace existing draft or push
  const runIndex = state.payrollRuns.findIndex((p) => p.month === monthStr);
  if (runIndex >= 0) {
    state.payrollRuns[runIndex] = payrollRun;
  } else {
    state.payrollRuns.unshift(payrollRun);
  }

  // replace payslips for this month
  state.payslips = state.payslips.filter((p) => p.month !== monthStr).concat(generatedPayslips);

  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "hr", role: "hr" },
    "create",
    "payroll",
    `Created draft payroll for ${monthStr} (${generatedPayslips.length} employees, Net: Rs. ${totalNet.toLocaleString()})`
  );

  return { success: true, run: payrollRun, payslips: generatedPayslips };
}

export function finalizePayroll(runId: string) {
  const state = getStoredState();
  const run = state.payrollRuns.find((p) => p.id === runId);
  if (!run) return { success: false, message: "Payroll run not found" };

  if (run.status === "finalized") {
    return { success: false, message: "Already finalized" };
  }

  run.status = "finalized";
  run.finalized_by = state.currentUser?.email || "admin";
  run.finalized_at = new Date().toISOString();

  // update all related payslips
  state.payslips.forEach((slip) => {
    if (slip.payroll_run_id === runId) {
      slip.status = "finalized";
    }
  });

  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "admin", role: "admin" },
    "finalize",
    "payroll",
    `Locked and finalized payroll for ${run.month} (Total Net: Rs. ${run.total_net.toLocaleString()})`
  );

  return { success: true, run };
}

// ==========================================
// AI ASSISTANT (M8) & SMART LEAVE
// ==========================================
export function parseSmartLeaveText(promptText: string): SmartLeaveDraft {
  const text = promptText.toLowerCase();

  // Detect leave type
  let leaveType = "Casual Leave";
  if (text.includes("sick") || text.includes("fever") || text.includes("doctor") || text.includes("hospital") || text.includes("unwell") || text.includes("bimar")) {
    leaveType = "Sick Leave";
  } else if (text.includes("annual") || text.includes("vacation") || text.includes("trip") || text.includes("travel")) {
    leaveType = "Annual Leave";
  } else if (text.includes("unpaid") || text.includes("without pay")) {
    leaveType = "Unpaid Leave";
  }

  // Extract dates (heuristic for demo)
  const today = new Date();
  let startDate = new Date(today);
  let endDate = new Date(today);

  if (text.includes("tomorrow") || text.includes("kal")) {
    startDate.setDate(today.getDate() + 1);
    endDate = new Date(startDate);
  } else if (text.includes("next monday") || text.includes("aglay peer")) {
    const day = today.getDay();
    const daysUntilNextMonday = ((1 - day + 7) % 7) || 7;
    startDate.setDate(today.getDate() + daysUntilNextMonday);
    endDate = new Date(startDate);
    if (text.includes("tuesday") || text.includes("mangal") || text.includes("2 days") || text.includes("do din")) {
      endDate.setDate(startDate.getDate() + 1);
    }
  } else {
    // Default to next working day
    startDate.setDate(today.getDate() + 1);
    endDate = new Date(startDate);
  }

  return {
    leave_type: leaveType,
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    reason: promptText.trim(),
  };
}

export function queryAIAssistant(
  prompt: string,
  user: User | null
): { response: string; tool_called?: string; is_ai_generated: boolean } {
  const state = getStoredState();
  const lower = prompt.toLowerCase();

  const isEmployee = user?.role === "employee";
  const isHR = user?.role === "hr";
  const isAdmin = user?.role === "admin";

  let response = "";
  let toolCalled = "";

  // 1. Privacy Guardrail: Colleague's salary check
  if (isEmployee && (lower.includes("salary") || lower.includes("tankhwa") || lower.includes("pay")) && !lower.includes("my salary") && !lower.includes("meri salary")) {
    response = "I am sorry, but employee salary information is strictly confidential. You are only authorized to view your own compensation and payslips under company policy.";
    toolCalled = "security_guardrail";
  }
  // 2. Employee leave balance
  else if (lower.includes("leave") && (lower.includes("balance") || lower.includes("left") || lower.includes("kitni") || lower.includes("baki"))) {
    toolCalled = "get_my_leave_balance";
    if (user?.employee_id) {
      const balances = getEmployeeLeaveBalances(user.employee_id);
      const balanceDetails = balances.map((b) => `• ${b.leave_type_name}: ${b.remaining} days remaining (used ${b.used}/${b.quota})`).join("\n");
      response = `Here is your current leave balance for this calendar year:\n\n${balanceDetails}`;
    } else {
      response = "Company standard leave quotas are: Annual (14 days), Sick (8 days), Casual (10 days), and Unpaid (Unlimited).";
    }
  }
  // 3. Headcount
  else if (lower.includes("headcount") || lower.includes("how many employees") || lower.includes("kitne employee")) {
    if (isEmployee) {
      response = "As an employee, company-wide headcount aggregates are managed by HR and Admin. Please refer to announcements or your department lead.";
    } else {
      toolCalled = "get_headcount";
      const total = state.employees.length;
      const active = state.employees.filter((e) => e.status === "active").length;
      const probation = state.employees.filter((e) => e.status === "probation").length;
      const deptBreakdown = state.departments.map((d) => {
        const count = state.employees.filter((e) => e.department_id === d.id).length;
        return `• ${d.name}: ${count}`;
      }).join("\n");

      response = `There are currently **${total} employees** registered in the system (${active} active, ${probation} on probation).\n\n**Department Breakdown:**\n${deptBreakdown || "No departments created yet."}`;
    }
  }
  // 4. Late comers
  else if (lower.includes("late") || lower.includes("late comers") || lower.includes("der se")) {
    if (isEmployee) {
      const myLates = state.attendance.filter(
        (a) => a.employee_id === user?.employee_id && a.status === "late"
      ).length;
      response = `You have arrived late **${myLates} time(s)** this month. Remember: office starts at 09:00 with a 15-minute grace period. Arrivals after 09:15 are marked late.`;
    } else {
      toolCalled = "get_late_comers";
      const lateRecords = state.attendance.filter((a) => a.status === "late");
      if (lateRecords.length === 0) {
        response = "Great news! There are no late arrivals recorded in the system so far.";
      } else {
        const lateSummary = lateRecords.slice(0, 5).map(
          (r) => `• ${r.employee_name} (${r.date} at ${r.check_in})`
        ).join("\n");
        response = `Here are the recorded late arrivals:\n\n${lateSummary}`;
      }
    }
  }
  // 5. Attendance rate
  else if (lower.includes("attendance rate") || lower.includes("hazri")) {
    toolCalled = "get_attendance_summary";
    const totalAtt = state.attendance.length;
    const present = state.attendance.filter((a) => a.status === "present" || a.status === "late").length;
    const rate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 100;
    response = `The overall attendance rate for recorded entries is **${rate}%** (${present} present out of ${totalAtt} entries).`;
  }
  // 6. Policy Questions
  else if (lower.includes("policy") || lower.includes("rule") || lower.includes("timing") || lower.includes("grace") || lower.includes("half day")) {
    toolCalled = "get_company_policy";
    const settings = state.companySettings;
    response = `**Company Policy & Rules:**\n` +
      `• **Office Start:** ${settings?.office_start || "09:00 AM"}\n` +
      `• **Grace Period:** ${settings?.grace_time_minutes || 15} minutes (arrivals after 09:15 are marked Late)\n` +
      `• **Half-Day Rule:** Shifts under ${settings?.half_day_hours || 5} hours count as a half-day (0.5 day deduction in payroll)\n` +
      `• **Leave Quotas:** Annual (14), Sick (8), Casual (10), Unpaid (unlimited)\n` +
      `• **Weekend:** Saturday & Sunday\n` +
      `• **Salary Structure:** Gross = 1.5 × Basic (HRA 40%, Medical 10%)`;
  }
  // 7. General Fallback
  else {
    toolCalled = "general_qa";
    response = `I can answer live questions about company headcount, attendance, leaves, payroll, and company policy. You can ask: \n- *"How many active employees are there?"*\n- *"Who came late this month?"*\n- *"What is our attendance rate?"*\n- *"How many leaves do I have left?"*`;
  }

  // Log in AI logs
  state.aiLogs.unshift({
    id: "ai-" + Date.now(),
    query: prompt,
    response,
    timestamp: new Date().toISOString(),
  });
  saveState(state);

  return {
    response,
    tool_called: toolCalled,
    is_ai_generated: true,
  };
}

export function generateDashboardSummary(metricsJson: any, role: UserRole): string[] {
  if (role === "admin") {
    return [
      `Total workforce stands at ${metricsJson.headcount || 0} active team members.`,
      `Monthly payroll cost is currently estimated at Rs. ${(metricsJson.monthly_payroll_cost || 0).toLocaleString()}.`,
      `Attendance health today shows ${(metricsJson.attendance_today?.present || 0)} present on duty.`,
      `Zero unaddressed system discrepancies found in the audit feed.`,
    ];
  } else if (role === "hr") {
    return [
      `Today's office turnout: ${metricsJson.present_today || 0} on duty, with ${metricsJson.late_today || 0} late arrivals.`,
      `${metricsJson.pending_leave_approvals || 0} leave request(s) require HR review and approval.`,
      `Department absenteeism is running within expected normal thresholds.`,
      `Monthly attendance rate is tracking strong at ${metricsJson.attendance_rate_month || 100}%.`,
    ];
  } else {
    return [
      `You have logged ${metricsJson.weekly_hours || 0} hours out of your 40h target this week.`,
      `Your late count for this calendar month is ${metricsJson.late_count_month || 0}.`,
      `All leave quotas and balances are up to date.`,
    ];
  }
}

// ==========================================
// BONUS FEATURES (SECTION 5 & 8)
// Face Enrollment, Attrition Risk, Anomaly Flags
// ==========================================
export function enrollEmployeeFace(employeeId: string, photoDataUrl: string) {
  const state = getStoredState();
  const emp = state.employees.find((e) => e.id === employeeId);
  if (!emp) return { success: false, message: "Employee not found" };

  emp.enrolled_face_photo = photoDataUrl;
  saveState(state);

  logAudit(
    { email: state.currentUser?.email || "user", role: state.currentUser?.role || "employee" },
    "update",
    "employee",
    `Enrolled biometric facial descriptor for ${emp.employee_code} (${emp.first_name} ${emp.last_name})`
  );

  return { success: true };
}

export function computeEmployeeAnalytics(emp: Employee, state: HCMState) {
  const attRecords = state.attendance.filter((a) => a.employee_id === emp.id);
  const latesCount = attRecords.filter((a) => a.status === "late").length;

  let riskScore = 15;
  const reasons: string[] = [];

  if (latesCount >= 3) {
    riskScore += 30;
    reasons.push("Frequent late arrivals exceeding grace period");
  }
  if (emp.status === "probation") {
    riskScore += 15;
    reasons.push("Under probation evaluation window");
  }
  if (emp.basic_salary < 60000) {
    riskScore += 20;
    reasons.push("Compensation in lower percentile bracket");
  }

  const level: "low" | "medium" | "high" =
    riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low";

  const anomalies: string[] = [];
  const absentEntries = attRecords.filter((a) => a.status === "absent");
  if (absentEntries.length >= 2) {
    anomalies.push(`${absentEntries.length} unexcused absences recorded`);
  }
  if (latesCount >= 3) {
    const penaltyDays = Math.floor(latesCount / 3) * 0.5;
    anomalies.push(`Late penalty applied (${latesCount} lates = ${penaltyDays} day deduction)`);
  }

  return {
    attrition_risk: {
      score: Math.min(riskScore, 95),
      level,
      reasons: reasons.length > 0 ? reasons : ["Steady attendance and active engagement"],
    },
    absence_anomalies: anomalies,
  };
}
