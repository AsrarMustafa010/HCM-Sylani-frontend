"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  Megaphone,
  History,
  Camera,
  UserCheck,
  ShieldCheck,
  Sparkles,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Logo } from "@/components/logo";

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Navigation items strictly mapped to roles from Section 2 & 8
  const adminLinks = [
    { label: "Company Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Organization Setup", href: "/organization", icon: Building },
    { label: "Employees Directory", href: "/employees", icon: Users },
    { label: "Attendance Board", href: "/attendance", icon: CalendarCheck },
    { label: "Leave Requests", href: "/leave", icon: CalendarDays },
    { label: "Monthly Payroll", href: "/payroll", icon: CreditCard },
    { label: "All Payslips", href: "/payslips", icon: FileText },
    { label: "Announcements", href: "/announcements", icon: Megaphone },
    { label: "Audit Log", href: "/audit-logs", icon: History },
  ];

  const hrLinks = [
    { label: "HR Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Daily Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Leave Approvals", href: "/leave", icon: CalendarDays },
    { label: "Monthly Payroll Draft", href: "/payroll", icon: CreditCard },
    { label: "Payslips", href: "/payslips", icon: FileText },
    { label: "Announcements", href: "/announcements", icon: Megaphone },
  ];

  const employeeLinks = [
    { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Web Check-In / Out", href: "/attendance/checkin", icon: Camera },
    { label: "My Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Apply Leave", href: "/leave", icon: CalendarDays },
    { label: "My Payslips", href: "/payslips", icon: FileText },
    { label: "Company Notices", href: "/announcements", icon: Megaphone },
    { label: "My Profile", href: "/profile", icon: UserCheck },
  ];

  const links =
    role === "admin" ? adminLinks : role === "hr" ? hrLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar (Desktop fixed, Mobile Slide-over) */}
      <aside
        className={cn(
          "w-64 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0 z-50 transition-all duration-300 shadow-[1px_0_12px_rgba(0,0,0,0.015)]",
          // Desktop styles
          "hidden md:flex",
          // Mobile Slide-over drawer styles
          isOpen && "fixed inset-y-0 left-0 flex shadow-2xl animate-in slide-in-from-left duration-200"
        )}
      >
        {/* Header / Brand info */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Logo size="sm" subtitle={`Role: ${role.toUpperCase()}`} />

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onClose}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400 font-bold shadow-xs border-r-3 border-indigo-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-indigo-600 dark:hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Callout Box in Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl p-3 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Real data tool-calling on live database. Click floating widget to chat.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
