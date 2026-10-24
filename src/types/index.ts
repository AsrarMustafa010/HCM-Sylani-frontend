// ==========================================
// ROLES & AUTH
// ==========================================
export type UserRole = "admin" | "hr" | "employee";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  must_change_password?: boolean;
  is_active: boolean;
  employee_id?: string;
  employee_name?: string;
  created_at: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  is_first_run: boolean;
}

// ==========================================
// ORGANIZATION & SETTINGS (M2)
// ==========================================
export interface CompanySettings {
  id?: string;
  company_name: string;
  office_start: string; // e.g. "09:00"
  grace_time_minutes: number; // e.g. 15 (late after 09:15)
  half_day_hours: number; // e.g. 5
  weekend_days: number[]; // [0, 6] = Sun, Sat
  office_lat: number;
  office_lng: number;
  office_radius_meters: number; // e.g. 150m
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  employee_count?: number;
}

export interface Designation {
  id: string;
  title: string;
  department_id: string;
  department_name?: string;
}

export interface LeaveType {
  id: string;
  name: string; // "Annual", "Sick", "Casual", "Unpaid"
  code: string; // "AL", "SL", "CL", "UL"
  yearly_quota: number; // AL: 14, SL: 8, CL: 10, UL: 0 (unlimited)
  is_paid: boolean;
  color?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  is_optional?: boolean;
}

// ==========================================
// EMPLOYEES (M3)
// ==========================================
export type EmployeeStatus = "active" | "probation" | "resigned" | "terminated";

export interface SalaryStructure {
  basic_salary: number;
  hra: number; // 40% of basic
  medical_allowance: number; // 10% of basic
  gross_salary: number; // 1.5 * basic
}

export interface Employee {
  id: string;
  employee_code: string; // e.g. "EMP-001"
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  department_id: string;
  department_name?: string;
  designation_id: string;
  designation_title?: string;
  join_date: string;
  status: EmployeeStatus;
  exit_date?: string;
  basic_salary: number;
  salary_structure: SalaryStructure;
  user_id?: string;
  enrolled_face_photo?: string; // Bonus: Face descriptor & enrolled photo
  attrition_risk?: {
    score: number; // 0-100%
    level: "low" | "medium" | "high";
    reasons: string[];
  };
  absence_anomalies?: string[];
  created_at: string;
}

// ==========================================
// ATTENDANCE (M4)
// ==========================================
export type AttendanceStatus =
  | "present"
  | "late"
  | "half_day"
  | "absent"
  | "missing_checkout"
  | "on_leave";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  department_name?: string;
  date: string; // YYYY-MM-DD
  check_in?: string; // HH:mm:ss or ISO
  check_out?: string;
  status: AttendanceStatus;
  work_hours?: number;
  check_in_source: "web" | "camera";
  lat?: number;
  lng?: number;
  distance_meters?: number;
}

export interface AttendanceCorrection {
  id: string;
  attendance_id?: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  requested_check_in: string;
  requested_check_out: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewer_comment?: string;
  created_at: string;
}

// ==========================================
// LEAVE (M5)
// ==========================================
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  leave_type_name?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days_count: number;
  reason: string;
  status: LeaveStatus;
  reviewer_id?: string;
  reviewer_comment?: string;
  applied_at: string;
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  quota: number;
  used: number;
  remaining: number;
}

// ==========================================
// PAYROLL (M6)
// ==========================================
export type PayrollStatus = "draft" | "finalized";

export interface PayrollRun {
  id: string;
  month: string; // "YYYY-MM"
  status: PayrollStatus;
  total_gross: number;
  total_deductions: number;
  total_tax: number;
  total_net: number;
  employee_count: number;
  finalized_by?: string;
  finalized_at?: string;
  created_at: string;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department_name: string;
  designation_title: string;
  month: string;
  working_days: number;
  days_present: number;
  days_absent: number;
  half_days: number;
  unpaid_leave_days: number;
  late_penalty_days?: number; // Bonus: 3 lates = 0.5 day penalty
  basic_salary: number;
  hra: number;
  medical_allowance: number;
  gross_salary: number;
  per_day_salary: number;
  attendance_deduction: number;
  tax_deduction: number;
  net_salary: number;
  status: PayrollStatus;
  generated_at: string;
}

// ==========================================
// DASHBOARD & ANALYTICS (M7)
// ==========================================
export interface AdminDashboardMetrics {
  headcount: number;
  active_count: number;
  probation_count: number;
  attrition_rate_ytd: number;
  monthly_payroll_cost: number;
  average_salary: number;
  headcount_by_department: { name: string; count: number }[];
  payroll_by_department: { name: string; cost: number }[];
  attendance_today: {
    present: number;
    late: number;
    half_day: number;
    absent: number;
    on_leave: number;
  };
}

export interface HRDashboardMetrics {
  headcount: number;
  present_today: number;
  on_leave_today: number;
  late_today: number;
  pending_leave_approvals: number;
  pending_attendance_corrections: number;
  attendance_rate_month: number;
  attendance_trend: { date: string; rate: number }[];
  absenteeism_by_dept: { department: string; rate: number }[];
  leave_by_type: { type: string; days: number }[];
  top_late_comers: { name: string; department: string; late_count: number }[];
}

export interface EmployeeDashboardMetrics {
  weekly_hours: number;
  hours_goal: number; // 40h
  late_count_month: number;
  leave_balances: LeaveBalance[];
  last_payslip?: Payslip;
  today_attendance?: AttendanceRecord;
}

// ==========================================
// AI ASSISTANT (M8)
// ==========================================
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  is_ai_generated?: boolean;
  tool_called?: string;
  insights?: string[];
}

export interface SmartLeaveDraft {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  days_count?: number;
}

// ==========================================
// COMMS & AUDIT (M9)
// ==========================================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: "all" | "hr" | "employee";
  author_name: string;
  author_role: UserRole;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "leave" | "attendance" | "payroll" | "announcement" | "system";
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_email: string;
  actor_role: UserRole;
  action: "create" | "update" | "approve" | "reject" | "finalize" | "login";
  entity_type: "company" | "employee" | "attendance" | "leave" | "payroll" | "user";
  entity_id?: string;
  details: string;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  timestamp: string;
}
