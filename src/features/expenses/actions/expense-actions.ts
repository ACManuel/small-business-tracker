"use server";

import { db } from "@/db";
import { expenses, expenseCategories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { expenseSchema } from "../schemas/expense-schema";

export async function getExpenseCategories() {
  const session = await auth();
  const businessId = session?.user?.businessId;

  if (businessId) {
    const { or, isNull: isNullFn } = await import("drizzle-orm");
    return db
      .select()
      .from(expenseCategories)
      .where(or(eq(expenseCategories.businessId, businessId), isNullFn(expenseCategories.businessId)))
      .orderBy(expenseCategories.name);
  }

  return db.select().from(expenseCategories).orderBy(expenseCategories.name);
}

export async function createExpense(data: {
  description: string;
  amount: number;
  categoryId: string;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(expenses).values({
    ...parsed.data,
    userId: session.user.id,
  });

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
  return { success: true };
}

export async function getExpenses(dateFrom?: string, dateTo?: string) {
  const conditions = [];

  if (dateFrom) conditions.push(gte(expenses.date, dateFrom));
  if (dateTo) conditions.push(lte(expenses.date, dateTo));

  const query = db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .leftJoin(
      expenseCategories,
      eq(expenses.categoryId, expenseCategories.id)
    );

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(expenses.date));
  }

  return query.orderBy(desc(expenses.date));
}

export async function getExpenseTotalByRange(
  dateFrom: string,
  dateTo: string
) {
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(and(gte(expenses.date, dateFrom), lte(expenses.date, dateTo)));

  return result.total;
}

export async function deleteExpense(id: string) {
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
  return { success: true };
}
