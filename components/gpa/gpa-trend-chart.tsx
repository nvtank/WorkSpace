"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface GPATrendChartProps {
  data: Array<{
    name: string;
    termGPA: number;
    cumulativeGPA: number;
    cumulativeCredits: number;
  }>;
  targetGPA?: number;
}

export function GPATrendChart({ data, targetGPA = 3.5 }: GPATrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm text-center">
        <h3 className="font-bold text-base text-ink mb-2">Biểu Đồ Xu Hướng GPA</h3>
        <div className="py-8 text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
          Chưa có dữ liệu học kỳ đã hoàn thành để vẽ biểu đồ
        </div>
      </div>
    );
  }

  return (
    <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-hairline">
        <div>
          <h3 className="font-bold text-base text-ink">Xu Hướng GPA Tích Luỹ Qua Từng Kỳ</h3>
          <p className="text-xs text-ink-mute">
            So sánh điểm trung bình từng học kỳ với GPA tích luỹ toàn khoá
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span>GPA Tích luỹ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sand" />
            <span>GPA Học kỳ</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
            <XAxis
              dataKey="name"
              stroke="#696969"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 4.0]}
              stroke="#696969"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[1.0, 2.0, 2.5, 3.0, 3.5, 4.0]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e6e6e6",
                fontSize: "12px",
                fontWeight: 600,
              }}
              formatter={(val: number, name: string) => [
                val.toFixed(2),
                name === "cumulativeGPA" ? "GPA Tích luỹ" : "GPA Học kỳ",
              ]}
            />
            <Line
              type="monotone"
              dataKey="cumulativeGPA"
              name="GPA Tích luỹ"
              stroke="#4a154b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4a154b" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="termGPA"
              name="GPA Học kỳ"
              stroke="#D9A441"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: "#D9A441" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
