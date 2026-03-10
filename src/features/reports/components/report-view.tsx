"use client";

import { useEffect, useState, useTransition } from "react";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import {
  SalesVsExpensesChart,
  ProfitTrendChart,
  ExpensePieChart,
} from "./report-charts";
import { PeriodSelector } from "./period-selector";
import { getDashboardSummary } from "@/features/dashboard/actions/dashboard-actions";
import {
  getReportData,
  getExpensesByCategory,
  type PeriodData,
  type CategoryBreakdown,
} from "../actions/report-actions";
import { getStartOfWeek, getStartOfMonth, getToday, formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "week" | "month";

export function ReportView() {
  const [period, setPeriod] = useState<Period>("week");
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState({ totalSales: 0, totalExpenses: 0, profit: 0 });
  const [chartData, setChartData] = useState<PeriodData[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    startTransition(async () => {
      const today = getToday();
      const dateFrom = period === "week" ? getStartOfWeek() : getStartOfMonth();

      const [summaryData, report, cats] = await Promise.all([
        getDashboardSummary(dateFrom, today),
        getReportData(dateFrom, today),
        getExpensesByCategory(dateFrom, today),
      ]);

      setSummary(summaryData);
      setChartData(report);
      setCategories(cats);
    });
  }, [period]);

  if (isPending && chartData.length === 0) {
    return (
      <div className="space-y-4">
        <PeriodSelector value={period} onChange={setPeriod} />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const periodLabel = period === "week" ? "Ganancia semanal" : "Ganancia del mes";

  return (
    <div className="space-y-4">
      <PeriodSelector value={period} onChange={setPeriod} />

      <SummaryCards
        totalSales={summary.totalSales}
        totalExpenses={summary.totalExpenses}
        profit={summary.profit}
        label={periodLabel}
      />

      <SalesVsExpensesChart data={chartData} />
      <ProfitTrendChart data={chartData} />
      <ExpensePieChart data={categories} />

      {/* Text summary */}
      <div className="text-center text-sm text-muted-foreground bg-background rounded-xl p-4 border">
        <p>
          {period === "week" ? "Esta semana" : "Este mes"} invertiste{" "}
          <span className="font-medium text-destructive">
            {formatCurrency(summary.totalExpenses)}
          </span>{" "}
          y vendiste{" "}
          <span className="font-medium text-green-600">
            {formatCurrency(summary.totalSales)}
          </span>
        </p>
        <p className="mt-1 font-medium text-foreground">
          {summary.profit > 0
            ? `Tu ganancia es ${formatCurrency(summary.profit)} 🎉`
            : summary.profit < 0
            ? `Tu pérdida es ${formatCurrency(Math.abs(summary.profit))} 📉`
            : "Estás en punto de equilibrio ⚖️"}
        </p>
      </div>
    </div>
  );
}
