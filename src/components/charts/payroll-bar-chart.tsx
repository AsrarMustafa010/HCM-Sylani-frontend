"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface PayrollBarChartProps {
  data?: { month: string; gross: number; net: number; tax: number }[];
}

const defaultData = [
  { month: "Jun", gross: 320000, net: 295000, tax: 25000 },
  { month: "Jul", gross: 350000, net: 320000, tax: 30000 },
  { month: "Aug", gross: 380000, net: 345000, tax: 35000 },
  { month: "Sep", gross: 420000, net: 380000, tax: 40000 },
  { month: "Oct", gross: 460000, net: 415000, tax: 45000 },
];

export function PayrollBarChart({ data = defaultData }: PayrollBarChartProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-64 w-full select-none outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          accessibilityLayer={false}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(148, 163, 184, 0.15)" : "#e2e8f0"}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b", fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b", fontWeight: 500 }}
            tickFormatter={(val) => `Rs.${Math.round(val / 1000)}k`}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)" }}
            contentStyle={{
              backgroundColor: isDark ? "#1e293b" : "#0f172a",
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#f8fafc",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
            }}
            labelStyle={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#f8fafc",
              fontWeight: 600,
              padding: "2px 0",
            }}
            formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
          />
          <Legend
            wrapperStyle={{
              fontSize: "11px",
              paddingTop: "8px",
              color: isDark ? "#e2e8f0" : "#334155",
            }}
            iconType="circle"
          />
          <Bar
            dataKey="gross"
            name="Gross Payroll"
            fill={isDark ? "#6366f1" : "#3b82f6"}
            radius={[6, 6, 0, 0]}
            maxBarSize={30}
          />
          <Bar
            dataKey="net"
            name="Net Disbursed"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
