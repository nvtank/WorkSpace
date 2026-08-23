"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrencyVND } from "@/lib/utils";

interface TrackerChartProps {
  type: "line" | "bar" | "donut";
  data: Array<{ name: string; value: number; category?: string }>;
  color?: string;
  unitType?: string;
  unitLabel?: string;
}

const DONUT_COLORS = ["#4a154b", "#F0A875", "#8CA88A", "#9B7EBD", "#D9A441", "#6E93B5", "#cc4117"];

export function TrackerChart({
  type,
  data,
  color = "#4a154b",
  unitType,
  unitLabel = "",
}: TrackerChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-xs text-ink-mute bg-canvas-cream/30 rounded-lg">
        Chưa có dữ liệu log cho kỳ này
      </div>
    );
  }

  const formatTooltipValue = (value: number) => {
    if (unitType === "currency") {
      return formatCurrencyVND(value);
    }
    return `${value} ${unitLabel}`.trim();
  };

  if (type === "donut") {
    return (
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [formatTooltipValue(val), ""]}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e6e6e6",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
            <XAxis
              dataKey="name"
              stroke="#696969"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#696969"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (unitType === "currency" ? `${v / 1000}k` : v)}
            />
            <Tooltip
              formatter={(val: number) => [formatTooltipValue(val), "Giá trị"]}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e6e6e6",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default: Line chart
  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
          <XAxis
            dataKey="name"
            stroke="#696969"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#696969"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (unitType === "currency" ? `${v / 1000}k` : v)}
          />
          <Tooltip
            formatter={(val: number) => [formatTooltipValue(val), "Giá trị"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e6e6e6",
              fontSize: "12px",
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
