"use server";

import { db } from "@/db";
import { expenses, expenseCategories, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { expenseSchema } from "../schemas/expense-schema";

const DEFAULT_CATEGORIES = [
  { name: "Ingredientes", color: "#ef4444" },
  { name: "Insumos", color: "#f59e0b" },
  { name: "Transporte", color: "#3b82f6" },
  { name: "Otros", color: "#6b7280" },
];

export async function getExpenseCategories() {
  const session = await auth();
  const businessId = session?.user?.businessId;

  if (!businessId) {
    return [];
  }

  const existing = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.businessId, businessId))
    .orderBy(expenseCategories.name);

  // Auto-crear categorías por defecto si el negocio no tiene ninguna
  if (existing.length === 0) {
    await db.insert(expenseCategories).values(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, businessId }))
    );
    return db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.businessId, businessId))
      .orderBy(expenseCategories.name);
  }

  return existing;
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
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return [];

  const conditions = [eq(users.businessId, businessId)];

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
    .innerJoin(users, eq(expenses.userId, users.id))
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
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return 0;

  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(
      and(
        eq(users.businessId, businessId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    );

  return result.total;
}

export async function deleteExpense(id: string) {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "No autorizado" };

  const [target] = await db
    .select({ businessId: users.businessId })
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .where(eq(expenses.id, id))
    .limit(1);

  if (!target || target.businessId !== businessId) {
    return { error: "Gasto no encontrado" };
  }

  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
  return { success: true };
}
