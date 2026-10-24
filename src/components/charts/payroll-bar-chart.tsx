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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={1} vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
            tickFormatter={(val) => `Rs.${Math.round(val / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [formatCurrency(value), name]}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconType="circle"
          />
          <Bar
            dataKey="gross"
            name="Gross Payroll"
            fill="#4f46e5"
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
