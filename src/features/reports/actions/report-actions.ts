"use server";

import { db } from "@/db";
import { sales, expenses, expenseCategories } from "@/db/schema";
import { and, gte, lte, sql, eq } from "drizzle-orm";

export type PeriodData = {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
};

export type CategoryBreakdown = {
  name: string;
  amount: number;
  color: string;
};

export async function getReportData(
  dateFrom: string,
  dateTo: string
): Promise<PeriodData[]> {
  const salesByDay = await db
    .select({
      date: sales.date,
      total: sql<number>`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .where(and(gte(sales.date, dateFrom), lte(sales.date, dateTo)))
    .groupBy(sales.date);

  const expensesByDay = await db
    .select({
      date: expenses.date,
      total: sql<number>`SUM(${expenses.amount})`,
    })
    .from(expenses)
    .where(and(gte(expenses.date, dateFrom), lte(expenses.date, dateTo)))
    .groupBy(expenses.date);

  const dates: string[] = [];
  const current = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T00:00:00");
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const salesMap = new Map(salesByDay.map((s) => [s.date, s.total]));
  const expensesMap = new Map(expensesByDay.map((e) => [e.date, e.total]));

  return dates.map((date) => {
    const s = salesMap.get(date) ?? 0;
    const e = expensesMap.get(date) ?? 0;
    return { date, sales: s, expenses: e, profit: s - e };
  });
}

export async function getExpensesByCategory(
  dateFrom: string,
  dateTo: string
): Promise<CategoryBreakdown[]> {
  const result = await db
    .select({
      name: expenseCategories.name,
      color: expenseCategories.color,
      amount: sql<number>`SUM(${expenses.amount})`,
    })
    .from(expenses)
    .innerJoin(
      expenseCategories,
      eq(expenses.categoryId, expenseCategories.id)
    )
    .where(and(gte(expenses.date, dateFrom), lte(expenses.date, dateTo)))
    .groupBy(expenseCategories.name, expenseCategories.color);

  return result;
}
