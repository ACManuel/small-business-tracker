"use server";

import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getBusinessId() {
  const session = await auth();
  return session?.user?.businessId ?? null;
}

export async function getBusinessSettings() {
  const businessId = await getBusinessId();
  if (!businessId) return null;

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  return business ?? null;
}

export async function updateBusinessSettings(data: {
  name: string;
  logoUrl: string | null;
  logoBgColor: string;
}) {
  const businessId = await getBusinessId();
  if (!businessId) return { error: "No autorizado" };

  const schema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(60),
    logoUrl: z.string().nullable(),
    logoBgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(businesses)
    .set({
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl,
      logoBgColor: parsed.data.logoBgColor,
    })
    .where(eq(businesses.id, businessId));

  revalidatePath("/configuracion");
  revalidatePath("/dashboard");
  revalidatePath("/gastos");
  revalidatePath("/ventas");
  revalidatePath("/productos");
  revalidatePath("/reportes");
  return { success: true };
}

export async function getBusinessUsers() {
  const businessId = await getBusinessId();
  if (!businessId) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.businessId, businessId))
    .orderBy(users.createdAt);
}

export async function createBusinessUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const businessId = await getBusinessId();
  if (!businessId) return { error: "No autorizado" };

  const schema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) return { error: "Este email ya está en uso" };

  const passwordHash = await hash(parsed.data.password, 12);

  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    businessId,
    role: "member",
  });

  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteBusinessUser(targetId: string) {
  const session = await auth();
  const currentId = session?.user?.id;
  const businessId = session?.user?.businessId;

  if (!businessId || !currentId) return { error: "No autorizado" };
  if (currentId === targetId)
    return { error: "No puedes eliminarte a ti mismo" };

  const [target] = await db
    .select({ businessId: users.businessId })
    .from(users)
    .where(eq(users.id, targetId))
    .limit(1);

  if (!target || target.businessId !== businessId)
    return { error: "Usuario no encontrado" };

  await db.delete(users).where(eq(users.id, targetId));
  revalidatePath("/configuracion");
  return { success: true };
}
