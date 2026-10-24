import { SalaryStructure } from "@/types";

export function calculateSalaryStructure(basic: number): SalaryStructure {
  const hra = Math.round(basic * 0.4);
  const medical_allowance = Math.round(basic * 0.1);
  const gross_salary = Math.round(basic * 1.5);
  return {
    basic_salary: basic,
    hra,
    medical_allowance,
    gross_salary,
  };
}

/**
 * Tax Slabs from Section 3:
 * Tax slab on gross × 12 (annual):
 * 0 to 600,000: 0%
 * 600,001 to 1,200,000: 5% of excess over 600k
 * 1,200,001 to 2,400,000: 30,000 + 15% of excess over 1.2M
 * 2,400,001 to 3,600,000: 210,000 + 25% of excess over 2.4M
 * Above 3,600,000: 510,000 + 35% of excess over 3.6M
 */
export function calculateAnnualTax(annualGross: number): number {
  if (annualGross <= 600_000) {
    return 0;
  }
  if (annualGross <= 1_200_000) {
    return Math.round((annualGross - 600_000) * 0.05);
  }
  if (annualGross <= 2_400_000) {
    return Math.round(30_000 + (annualGross - 1_200_000) * 0.15);
  }
  if (annualGross <= 3_600_000) {
    return Math.round(210_000 + (annualGross - 2_400_000) * 0.25);
  }
  return Math.round(510_000 + (annualGross - 3_600_000) * 0.35);
}

export function calculateMonthlyTax(monthlyGross: number): number {
  const annualGross = monthlyGross * 12;
  const annualTax = calculateAnnualTax(annualGross);
  return Math.round(annualTax / 12);
}

/**
 * Per Day = gross ÷ working days
 * Deductions:
 * - Absent days
 * - Unpaid leave days
 * - Half days (0.5 × half days)
 * - BONUS RULE (Section 8): Late penalty rule -> 3 lates = 0.5 day deduction
 */
export function calculatePayrollDeductions({
  grossSalary,
  workingDays,
  absentDays,
  unpaidLeaveDays,
  halfDays,
  lateDays = 0,
}: {
  grossSalary: number;
  workingDays: number;
  absentDays: number;
  unpaidLeaveDays: number;
  halfDays: number;
  lateDays?: number;
}) {
  const perDaySalary = workingDays > 0 ? grossSalary / workingDays : 0;

  // Bonus rule: 3 lates = 0.5 day penalty deduction
  const latePenaltyDays = Math.floor(lateDays / 3) * 0.5;

  const effectiveDeductionDays =
    absentDays + unpaidLeaveDays + 0.5 * halfDays + latePenaltyDays;

  const attendanceDeduction = Math.round(perDaySalary * effectiveDeductionDays);
  const monthlyTax = calculateMonthlyTax(grossSalary);
  const netSalary = Math.max(0, Math.round(grossSalary - attendanceDeduction - monthlyTax));

  return {
    perDaySalary: Math.round(perDaySalary),
    effectiveDeductionDays,
    latePenaltyDays,
    attendanceDeduction,
    monthlyTax,
    netSalary,
  };
}

/**
 * Check-in status helper:
 * Office Start: 09:00, Grace: 15 min -> Late after 09:15
 */
export function evaluateCheckInStatus(
  checkInTimeStr: string,
  officeStart = "09:00",
  graceMinutes = 15
): "present" | "late" {
  let hours = 0;
  let minutes = 0;

  if (checkInTimeStr.includes("T")) {
    const d = new Date(checkInTimeStr);
    hours = d.getHours();
    minutes = d.getMinutes();
  } else {
    const parts = checkInTimeStr.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  }

  const [officeHour, officeMin] = officeStart.split(":").map(Number);
  const startTotalMinutes = officeHour * 60 + officeMin;
  const checkInTotalMinutes = hours * 60 + minutes;

  if (checkInTotalMinutes > startTotalMinutes + graceMinutes) {
    return "late";
  }
  return "present";
}

/**
 * Haversine distance in meters (Section 5 Office Geofence)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
