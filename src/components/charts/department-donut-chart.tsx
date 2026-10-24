"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DepartmentDonutChartProps {
  data: { name: string; count: number }[];
}

const COLORS = ["#0f172a", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];

export function DepartmentDonutChart({ data }: DepartmentDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : [
    { name: "Engineering", count: 4 },
    { name: "HR", count: 2 },
    { name: "Marketing", count: 2 },
  ];

  if (!mounted) {
    return <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />;
  }

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between">
      <div className="h-full w-full sm:w-1/2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => [`${value} Employees`, name]}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {total}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Staff</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 pl-0 sm:pl-4 space-y-2 mt-4 sm:mt-0 text-xs">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[110px]">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
