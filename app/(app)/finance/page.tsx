"use client";

import React, { useState, useMemo } from "react";
import { useTrackers, useTrackerEntries } from "@/hooks/use-trackers";
import {
  formatCurrencyVND,
  formatZonedDate,
} from "@/lib/utils";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart as PieIcon,
  Tag,
  Trash2,
  Receipt,
  Sparkles,
  Search,
  DollarSign,
  Scale,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Học tập",
  "Giải trí",
  "Mua sắm",
  "Hoá đơn",
  "Khác",
];

const INCOME_CATEGORIES = [
  "Lương / Làm thêm",
  "Học bổng / Thưởng",
  "Gia đình chu cấp",
  "Freelance / Dự án",
  "Khác",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Ăn uống": "#F0A875",
  "Di chuyển": "#6E93B5",
  "Học tập": "#8CA88A",
  "Giải trí": "#9B7EBD",
  "Mua sắm": "#D9A441",
  "Hoá đơn": "#cc4117",
  "Lương / Làm thêm": "#007a5a",
  "Học bổng / Thưởng": "#2eb67d",
  "Gia đình chu cấp": "#4a154b",
  "Freelance / Dự án": "#ecb22e",
  "Khác": "#696969",
};

export default function FinancePage() {
  const { trackers } = useTrackers();
  const financeTracker = trackers.find((t) => t.unitType === "currency") || trackers[0];

  const { entries, logEntry, deleteEntry, isLogging } = useTrackerEntries({
    trackerId: financeTracker?.id,
  });

  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add transaction form
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [itemNote, setItemNote] = useState("");
  const [itemAmount, setItemAmount] = useState<number | "">("");
  const [itemCategory, setItemCategory] = useState("Ăn uống");
  const [itemDate, setItemDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Quick preset buttons for student spending & earnings
  const quickExpensePresets = [
    { label: "Ăn cơm trưa/tối", amount: 25000, cat: "Ăn uống" },
    { label: "Uống nước / Cà phê", amount: 20000, cat: "Ăn uống" },
    { label: "Đổ xăng xe", amount: 50000, cat: "Di chuyển" },
    { label: "In tài liệu học", amount: 20000, cat: "Học tập" },
    { label: "Bữa sáng", amount: 20000, cat: "Ăn uống" },
  ];

  const quickIncomePresets = [
    { label: "Lương làm thêm", amount: 500000, cat: "Lương / Làm thêm" },
    { label: "Tiền gia đình gửi", amount: 2000000, cat: "Gia đình chu cấp" },
    { label: "Làm bài tập / Dự án nhỏ", amount: 300000, cat: "Freelance / Dự án" },
  ];

  // Calculations
  const {
    filteredEntries,
    chartData,
    categoryData,
    totalIncome,
    totalExpense,
    netBalance,
    avgDailyExpense,
  } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === "week") {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = subDays(now, 90);
      end = now;
    }

    let sumIncome = 0;
    let sumExpense = 0;

    const filtered = entries.filter((e) => {
      const d = parseISO(e.date);
      const inRange = isWithinInterval(d, { start, end });
      const matchSearch = searchQuery
        ? (e.note || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.category || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const isInc: boolean = Boolean(
        e.type === "income" || (e.category && INCOME_CATEGORIES.includes(e.category))
      );
      const matchType =
        filterType === "all"
          ? true
          : filterType === "income"
          ? isInc
          : !isInc;
      return inRange && matchSearch && matchType;
    });

    // Group by day for Bar Chart + Collect detailed items list for Tooltip
    const dayMap: Record<
      string,
      {
        dateStr: string;
        dayLabel: string;
        expenseTotal: number;
        incomeTotal: number;
        items: Array<{ note: string; value: number; category: string; isIncome: boolean }>;
      }
    > = {};

    const daysCount = period === "week" ? 7 : 14;
    const rangeStart = period === "week" ? start : subDays(now, 13);

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(rangeStart);
      d.setDate(rangeStart.getDate() + i);
      const dateKey = format(d, "yyyy-MM-dd");
      const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
      dayMap[dateKey] = {
        dateStr: dateKey,
        dayLabel: `${dayName} (${format(d, "dd/MM")})`,
        expenseTotal: 0,
        incomeTotal: 0,
        items: [],
      };
    }

    const catMap: Record<string, number> = {};

    // Process all entries in period to compute global sums accurately
    entries.forEach((e) => {
      const d = parseISO(e.date);
      if (isWithinInterval(d, { start, end })) {
        const isInc: boolean = Boolean(
          e.type === "income" || (e.category && INCOME_CATEGORIES.includes(e.category))
        );
        if (isInc) {
          sumIncome += e.value;
        } else {
          sumExpense += e.value;
        }

        const cat = e.category || (isInc ? "Thu nhập khác" : "Chi tiêu khác");
        catMap[cat] = (catMap[cat] || 0) + e.value;

        const dKey = format(d, "yyyy-MM-dd");
        if (dayMap[dKey]) {
          if (isInc) {
            dayMap[dKey].incomeTotal += e.value;
          } else {
            dayMap[dKey].expenseTotal += e.value;
          }
          dayMap[dKey].items.push({
            note: e.note || cat,
            value: e.value,
            category: cat,
            isIncome: isInc,
          });
        }
      }
    });

    const chart = Object.values(dayMap);
    const catChart = Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#4a154b",
    }));

    const expenseDaysCount = chart.filter((c) => c.expenseTotal > 0).length || 1;

    return {
      filteredEntries: filtered,
      chartData: chart,
      categoryData: catChart,
      totalIncome: sumIncome,
      totalExpense: sumExpense,
      netBalance: sumIncome - sumExpense,
      avgDailyExpense: Math.round(sumExpense / expenseDaysCount),
    };
  }, [entries, period, searchQuery, filterType]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemAmount || itemAmount <= 0) return;

    if (!financeTracker) {
      toast.error("Chưa có tracker tài chính");
      return;
    }

    await logEntry({
      trackerId: financeTracker.id,
      value: Number(itemAmount),
      type: transactionType,
      category: itemCategory,
      note: itemNote.trim() || itemCategory,
      date: itemDate,
    });

    setItemAmount("");
    setItemNote("");
    setIsAddOpen(false);
  };

  const handleApplyPreset = (preset: { label: string; amount: number; cat: string }, type: "expense" | "income") => {
    setTransactionType(type);
    setItemNote(preset.label);
    setItemAmount(preset.amount);
    setItemCategory(preset.cat);
    setIsAddOpen(true);
  };

  // Custom rich Tooltip for Bar Chart (lists exact breakdown items: "Cơm trưa: 25k, Trà đào: 20k, Lương: 500k")
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface p-3.5 rounded-xl border border-hairline shadow-elevation2 text-xs min-w-[240px]">
          <div className="flex items-center justify-between pb-2 border-b border-hairline mb-2">
            <span className="font-bold text-ink">{data.dayLabel}</span>
            <div className="flex flex-col items-end">
              {data.incomeTotal > 0 && (
                <span className="font-bold text-semantic-success text-xs">
                  +{formatCurrencyVND(data.incomeTotal)}
                </span>
              )}
              <span className="font-bold text-primary text-xs">
                -{formatCurrencyVND(data.expenseTotal)}
              </span>
            </div>
          </div>

          {data.items && data.items.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-ink-mute block">
                Chi tiết các khoản trong ngày:
              </span>
              {data.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 text-ink py-0.5"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        item.isIncome ? "bg-semantic-success" : "bg-primary"
                      )}
                    />
                    <span className="truncate">{item.note}</span>
                  </div>
                  <span
                    className={cn(
                      "font-bold flex-shrink-0",
                      item.isIncome ? "text-semantic-success" : "text-primary"
                    )}
                  >
                    {item.isIncome ? "+" : "-"}
                    {formatCurrencyVND(item.value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-ink-mute text-[11px]">Không có giao dịch nào</span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-hairline shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Quản Lý Thu Chi & Tài Chính</h2>
            <p className="text-xs text-ink-mute">
              Ghi chép thu nhập, chi tiêu từng bữa ăn, nước uống và tính toán số dư chênh lệch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTransactionType("income");
              setItemCategory("Lương / Làm thêm");
              setIsAddOpen(true);
            }}
            className="btn-secondary inline-flex items-center gap-1.5 text-semantic-success border-semantic-success/30 hover:bg-semantic-success/10"
          >
            <TrendingUp className="w-4 h-4 text-semantic-success" />
            <span>+ Thu nhập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTransactionType("expense");
              setItemCategory("Ăn uống");
              setIsAddOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-1.5"
          >
            <TrendingDown className="w-4 h-4" />
            <span>- Chi tiêu</span>
          </button>
        </div>
      </div>

      {/* Quick Presets for Fast Input */}
      <div className="card-base bg-surface p-4 border border-hairline shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-ink uppercase tracking-wider">
            Ghi nhanh thường dùng:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Expense presets */}
          {quickExpensePresets.map((p, idx) => (
            <button
              key={`exp-${idx}`}
              type="button"
              onClick={() => handleApplyPreset(p, "expense")}
              className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-canvas-cream/80 hover:bg-canvas-lavender text-ink border border-hairline transition-colors flex items-center gap-1.5"
            >
              <span>{p.label}</span>
              <span className="font-bold text-primary">(-{p.amount / 1000}k)</span>
            </button>
          ))}

          {/* Income presets */}
          {quickIncomePresets.map((p, idx) => (
            <button
              key={`inc-${idx}`}
              type="button"
              onClick={() => handleApplyPreset(p, "income")}
              className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-semantic-success/10 hover:bg-semantic-success/20 text-ink border border-semantic-success/30 transition-colors flex items-center gap-1.5"
            >
              <span>{p.label}</span>
              <span className="font-bold text-semantic-success">(+{p.amount / 1000}k)</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4 KPI Summary Cards (Thu, Chi, Chênh lệch, Trung bình/ngày) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng Thu */}
        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Tổng Thu Nhập
            </span>
            <TrendingUp className="w-4 h-4 text-semantic-success" />
          </div>
          <div className="text-2xl font-bold text-semantic-success tracking-tight">
            +{formatCurrencyVND(totalIncome)}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            {period === "week" ? "Tuần này" : period === "month" ? "Tháng này" : "90 ngày"}
          </p>
        </div>

        {/* Tổng Chi */}
        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Tổng Chi Tiêu
            </span>
            <TrendingDown className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary tracking-tight">
            -{formatCurrencyVND(totalExpense)}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            {period === "week" ? "Tuần này" : period === "month" ? "Tháng này" : "90 ngày"}
          </p>
        </div>

        {/* Chênh Lệch / Số Dư Thực */}
        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Chênh Lệch (Thu - Chi)
            </span>
            <Scale className="w-4 h-4 text-sand" />
          </div>
          <div
            className={cn(
              "text-2xl font-bold tracking-tight",
              netBalance >= 0 ? "text-semantic-success" : "text-semantic-error"
            )}
          >
            {netBalance >= 0 ? "+" : ""}
            {formatCurrencyVND(netBalance)}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            {netBalance >= 0 ? "Tiết kiệm dương 👍" : "Thâm hụt cần cân đối ⚠️"}
          </p>
        </div>

        {/* Trung Bình Tiêu Mỗi Ngày */}
        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Trung Bình Chi / Ngày
            </span>
            <Receipt className="w-4 h-4 text-ink-mute" />
          </div>
          <div className="text-2xl font-bold text-ink tracking-tight">
            {formatCurrencyVND(avgDailyExpense)}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Mục tiêu: ≤ {formatCurrencyVND(150000)}/ngày
          </p>
        </div>
      </div>

      {/* Main Charts: Interactive Bar Chart with Detailed Tooltip + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Expenses & Income Bar Chart (2 cols) */}
        <div className="lg:col-span-2 card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-hairline">
            <div>
              <h3 className="font-bold text-base text-ink">Biểu Đồ Thu Chi Từng Ngày</h3>
              <p className="text-xs text-ink-mute">
                👉 <span className="font-semibold text-primary">Di chuột vào từng cột</span> để xem danh sách chi tiết (Cơm trưa, Cà phê, Lương...)
              </p>
            </div>

            {/* Period tabs */}
            <div className="flex items-center gap-1 bg-canvas-cream/60 p-1 rounded-pill border border-hairline">
              {(["week", "month", "all"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-pill transition-all",
                    period === p
                      ? "bg-canvas text-primary shadow-sm"
                      : "text-ink-mute hover:text-ink"
                  )}
                >
                  {p === "week" ? "Tuần này" : p === "month" ? "Tháng này" : "90 ngày"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
                <XAxis
                  dataKey="dayLabel"
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
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar name="Chi tiêu" dataKey="expenseTotal" fill="#4a154b" radius={[6, 6, 0, 0]} />
                <Bar name="Thu nhập" dataKey="incomeTotal" fill="#007a5a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Donut Breakdown (1 col) */}
        <div className="lg:col-span-1 card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-hairline">
            <PieIcon className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-base text-ink">Phân Bổ Hạng Mục</h3>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-ink-mute">
              Chưa có dữ liệu phân loại
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrencyVND(val), ""]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e6e6e6",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend */}
              <div className="space-y-1.5 pt-2 border-t border-hairline max-h-32 overflow-y-auto">
                {categoryData.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-ink">{cat.name}</span>
                    </div>
                    <span className="text-primary font-bold">
                      {formatCurrencyVND(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Table with Type Filter */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-hairline">
          <div className="flex items-center gap-3">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-base text-ink">
              Lịch Sử Giao Dịch ({filteredEntries.length})
            </h3>

            {/* Filter type buttons */}
            <div className="flex items-center gap-1 bg-canvas-cream/60 p-0.5 rounded-pill border border-hairline text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-semibold transition-all",
                  filterType === "all" ? "bg-canvas text-primary shadow-xs" : "text-ink-mute"
                )}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterType("expense")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-semibold transition-all",
                  filterType === "expense" ? "bg-canvas text-primary shadow-xs" : "text-ink-mute"
                )}
              >
                Chi tiêu (-)
              </button>
              <button
                type="button"
                onClick={() => setFilterType("income")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-semibold transition-all",
                  filterType === "income" ? "bg-canvas text-semantic-success shadow-xs" : "text-ink-mute"
                )}
              >
                Thu nhập (+)
              </button>
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung, danh mục..."
              className="input-base text-xs pl-9 py-1.5"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
            Không có khoản thu chi nào khớp với bộ lọc
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-mute font-bold">
                  <th className="pb-2.5">Thời gian</th>
                  <th className="pb-2.5">Nội dung chi tiết</th>
                  <th className="pb-2.5">Hạng mục</th>
                  <th className="pb-2.5 text-right">Số tiền</th>
                  <th className="pb-2.5 text-right">Xoá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {filteredEntries.map((e) => {
                  const isInc =
                    e.type === "income" || (e.category && INCOME_CATEGORIES.includes(e.category));

                  return (
                    <tr key={e.id} className="hover:bg-canvas-cream/20 transition-colors">
                      <td className="py-3 text-ink-mute font-medium whitespace-nowrap">
                        {formatZonedDate(e.date, "EEEE, dd/MM/yyyy")}
                      </td>
                      <td className="py-3 font-bold text-ink">
                        {e.note || "Giao dịch"}
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2.5 py-0.5 rounded-pill text-[11px] font-bold text-white"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[e.category || "Khác"] || (isInc ? "#007a5a" : "#4a154b"),
                          }}
                        >
                          {e.category || (isInc ? "Thu nhập" : "Ăn uống")}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-3 text-right font-bold text-sm whitespace-nowrap",
                          isInc ? "text-semantic-success" : "text-primary"
                        )}
                      >
                        {isInc ? "+" : "-"}
                        {formatCurrencyVND(e.value)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Xoá giao dịch này?")) {
                              deleteEntry(e.id);
                            }
                          }}
                          className="text-ink-mute hover:text-semantic-error p-1"
                          title="Xoá"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Dialog */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-cream/30">
              <h3 className="font-bold text-base text-ink">
                {transactionType === "income" ? "Ghi Khoản Thu Nhập (+)" : "Ghi Khoản Chi Tiêu (-)"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-ink-mute hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-canvas-cream/60 rounded-pill border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("expense");
                    setItemCategory("Ăn uống");
                  }}
                  className={cn(
                    "py-1.5 rounded-pill text-xs font-bold transition-all",
                    transactionType === "expense"
                      ? "bg-primary text-white shadow-xs"
                      : "text-ink-mute hover:text-ink"
                  )}
                >
                  - Chi tiêu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("income");
                    setItemCategory("Lương / Làm thêm");
                  }}
                  className={cn(
                    "py-1.5 rounded-pill text-xs font-bold transition-all",
                    transactionType === "income"
                      ? "bg-semantic-success text-white shadow-xs"
                      : "text-ink-mute hover:text-ink"
                  )}
                >
                  + Thu nhập
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Số tiền (VNĐ) <span className="text-semantic-error">*</span>
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  min="500"
                  step="500"
                  value={itemAmount}
                  onChange={(e) =>
                    setItemAmount(e.target.value ? parseFloat(e.target.value) : "")
                  }
                  placeholder="VD: 25000"
                  className={cn(
                    "input-base text-lg font-bold",
                    transactionType === "income" ? "text-semantic-success" : "text-primary"
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Nội dung chi tiết <span className="text-semantic-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder={
                    transactionType === "income"
                      ? "VD: Lương ca tối, Tiền làm đồ án, Ba mẹ gửi..."
                      : "VD: Cơm sườn 25k, Trà tắc 20k, Đổ xăng 50k..."
                  }
                  className="input-base text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Hạng mục
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="input-base text-xs"
                  >
                    {(transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Ngày giao dịch
                  </label>
                  <input
                    type="date"
                    required
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-outline-compact text-xs"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isLogging || !itemAmount}
                  className={cn(
                    "btn-primary-compact text-xs",
                    transactionType === "income" && "bg-semantic-success hover:bg-semantic-success/90"
                  )}
                >
                  {isLogging ? "Đang lưu..." : "Lưu giao dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
