"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { DaySummary } from "../actions/dashboard-actions";

const DAY_LABELS: Record<string, string> = {
  "0": "Dom",
  "1": "Lun",
  "2": "Mar",
  "3": "Mié",
  "4": "Jue",
  "5": "Vie",
  "6": "Sáb",
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_LABELS[String(d.getDay())] ?? dateStr;
}

export function WeeklyChart({ data }: { data: DaySummary[] }) {
  const chartData = data.map((d) => ({
    ...d,
    day: formatDay(d.date),
  }));

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium mb-3">Esta semana</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const s = payload[0]?.value as number;
                  const e = payload[1]?.value as number;
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md text-xs">
                      <p className="text-green-600">
                        Ventas: {formatCurrency(s)}
                      </p>
                      <p className="text-red-500">
                        Gastos: {formatCurrency(e)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
