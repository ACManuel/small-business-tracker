"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { PeriodData, CategoryBreakdown } from "../actions/report-actions";

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function SalesVsExpensesChart({ data }: { data: PeriodData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium mb-3">Ventas vs Gastos</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md text-xs">
                      <p className="font-medium mb-1">{label}</p>
                      <p className="text-green-600">
                        Ventas: {formatCurrency(payload[0]?.value as number)}
                      </p>
                      <p className="text-red-500">
                        Gastos: {formatCurrency(payload[1]?.value as number)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="sales" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Ventas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfitTrendChart({ data }: { data: PeriodData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium mb-3">Tendencia de ganancia</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const val = payload[0]?.value as number;
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md text-xs">
                      <p className="font-medium">{label}</p>
                      <p className={val >= 0 ? "text-green-600" : "text-red-500"}>
                        {formatCurrency(val)}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpensePieChart({ data }: { data: CategoryBreakdown[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm font-medium mb-3">Gastos por categoría</p>
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin datos en este período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium mb-3">Gastos por categoría</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const entry = payload[0];
                  const pct =
                    total > 0
                      ? (((entry?.value as number) / total) * 100).toFixed(0)
                      : "0";
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md text-xs">
                      <p className="font-medium">{entry?.name}</p>
                      <p>
                        {formatCurrency(entry?.value as number)} ({pct}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {data.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs text-muted-foreground">{cat.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
