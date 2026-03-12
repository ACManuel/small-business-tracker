"use server";

import { db } from "@/db";
import { sales, expenses, users } from "@/db/schema";
import { and, gte, lte, sql, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export type DaySummary = {
  date: string;
  sales: number;
  expenses: number;
};

export async function getDashboardSummary(
  dateFrom: string,
  dateTo: string
) {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) {
    return {
      totalSales: 0,
      totalExpenses: 0,
      profit: 0,
    };
  }

  const [salesResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .innerJoin(users, eq(sales.userId, users.id))
    .where(
      and(
        eq(users.businessId, businessId),
        gte(sales.date, dateFrom),
        lte(sales.date, dateTo)
      )
    );

  const [expensesResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(
      and(
        eq(users.businessId, businessId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    );

  return {
    totalSales: salesResult.total,
    totalExpenses: expensesResult.total,
    profit: salesResult.total - expensesResult.total,
  };
}

export async function getWeeklyChartData(
  dateFrom: string,
  dateTo: string
): Promise<DaySummary[]> {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return [];

  const salesByDay = await db
    .select({
      date: sales.date,
      total: sql<number>`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .innerJoin(users, eq(sales.userId, users.id))
    .where(
      and(
        eq(users.businessId, businessId),
        gte(sales.date, dateFrom),
        lte(sales.date, dateTo)
      )
    )
    .groupBy(sales.date);

  const expensesByDay = await db
    .select({
      date: expenses.date,
      total: sql<number>`SUM(${expenses.amount})`,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(
      and(
        eq(users.businessId, businessId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    )
    .groupBy(expenses.date);

  // Generate all dates in range
  const dates: string[] = [];
  const current = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T00:00:00");
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const salesMap = new Map(salesByDay.map((s) => [s.date, s.total]));
  const expensesMap = new Map(expensesByDay.map((e) => [e.date, e.total]));

  return dates.map((date) => ({
    date,
    sales: salesMap.get(date) ?? 0,
    expenses: expensesMap.get(date) ?? 0,
  }));
}
