"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceTrendChartProps {
  data?: { date: string; rate: number; present: number; late: number }[];
}

const defaultData = [
  { date: "Oct 18", rate: 92, present: 18, late: 2 },
  { date: "Oct 19", rate: 96, present: 22, late: 1 },
  { date: "Oct 20", rate: 88, present: 16, late: 4 },
  { date: "Oct 21", rate: 95, present: 24, late: 1 },
  { date: "Oct 22", rate: 100, present: 25, late: 0 },
  { date: "Oct 23", rate: 94, present: 21, late: 2 },
  { date: "Oct 24", rate: 98, present: 24, late: 1 },
];

export function AttendanceTrendChart({ data = defaultData }: AttendanceTrendChartProps) {
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={1} vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
          />
          <YAxis
            domain={[60, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
            formatter={(value: any) => [`${value}% Attendance Rate`, "Rate"]}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#4f46e5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#attendanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
