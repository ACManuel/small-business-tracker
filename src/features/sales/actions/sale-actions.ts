"use server";

import { db } from "@/db";
import { sales, saleItems, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, and, gte, lte, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { saleSchema } from "../schemas/sale-schema";

export async function createSale(data: {
  date: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  freeAmount?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const parsed = saleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const totalAmount =
    parsed.data.items.length > 0
      ? parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0)
      : (parsed.data.freeAmount ?? 0);

  const [sale] = await db
    .insert(sales)
    .values({
      userId: session.user.id,
      date: parsed.data.date,
      totalAmount,
      notes: parsed.data.notes,
    })
    .returning();

  if (parsed.data.items.length > 0) {
    await db.insert(saleItems).values(
      parsed.data.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      }))
    );
  }

  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
  return { success: true };
}

export async function getSales(dateFrom?: string, dateTo?: string) {
  const conditions = [];
  if (dateFrom) conditions.push(gte(sales.date, dateFrom));
  if (dateTo) conditions.push(lte(sales.date, dateTo));

  const query = db.select().from(sales);

  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(sales.date));
  }
  return query.orderBy(desc(sales.date));
}

export async function getSaleWithItems(saleId: string) {
  const [sale] = await db
    .select()
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);

  if (!sale) return null;

  const items = await db
    .select({
      id: saleItems.id,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
      subtotal: saleItems.subtotal,
      productName: products.name,
    })
    .from(saleItems)
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.saleId, saleId));

  return { ...sale, items };
}

export async function getSaleTotalByRange(
  dateFrom: string,
  dateTo: string
) {
  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(and(gte(sales.date, dateFrom), lte(sales.date, dateTo)));

  return result.total;
}

export async function deleteSale(id: string) {
  await db.delete(sales).where(eq(sales.id, id));
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
  return { success: true };
}
