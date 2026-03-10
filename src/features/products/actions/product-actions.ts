"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productSchema } from "../schemas/product-schema";

export async function getProducts() {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return [];

  return db
    .select()
    .from(products)
    .where(
      or(eq(products.businessId, businessId), isNull(products.businessId))
    )
    .orderBy(products.name);
}

export async function getActiveProducts() {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return [];

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(eq(products.businessId, businessId), isNull(products.businessId))
      )
    )
    .orderBy(products.name);
}

export async function createProduct(data: {
  name: string;
  description?: string;
  salePrice: number;
}) {
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "No autenticado" };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(products).values({ ...parsed.data, businessId });
  revalidatePath("/productos");
  return { success: true };
}

export async function updateProduct(
  id: string,
  data: { name: string; description?: string; salePrice: number }
) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));
  revalidatePath("/productos");
  return { success: true };
}

export async function toggleProduct(id: string, isActive: boolean) {
  await db
    .update(products)
    .set({ isActive, updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));
  revalidatePath("/productos");
  return { success: true };
}
