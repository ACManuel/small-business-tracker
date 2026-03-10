import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { hash } from "bcryptjs";
import { eq, isNull } from "drizzle-orm";
import * as schema from "./schema";

async function seed() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL no está configurada");
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log("🌱 Iniciando seed...");

  // Crear o reutilizar negocio
  let [business] = await db.select().from(schema.businesses).limit(1);
  if (!business) {
    [business] = await db
      .insert(schema.businesses)
      .values({ name: "Mi Negocio" })
      .returning();
    console.log(`✅ Negocio creado: ${business.name}`);
  } else {
    console.log(`ℹ️  Negocio existente: ${business.name}`);
  }

  // Crear o actualizar usuario admin
  const passwordHash = await hash("admin123", 12);
  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@negocio.com"))
    .limit(1);

  let user;
  if (existingUsers.length === 0) {
    [user] = await db
      .insert(schema.users)
      .values({
        name: "Admin",
        email: "admin@negocio.com",
        passwordHash,
        businessId: business.id,
        role: "owner",
      })
      .returning();
    console.log(`✅ Usuario creado: ${user.email} (contraseña: admin123)`);
  } else {
    await db
      .update(schema.users)
      .set({ businessId: business.id, role: "owner" })
      .where(eq(schema.users.email, "admin@negocio.com"));
    user = existingUsers[0];
    console.log(`ℹ️  Usuario existente actualizado: ${user.email}`);
  }

  // Crear o actualizar categorías de gastos
  const categoryData = [
    { name: "Ingredientes", color: "#ef4444" },
    { name: "Insumos", color: "#f59e0b" },
    { name: "Transporte", color: "#3b82f6" },
    { name: "Otros", color: "#6b7280" },
  ];

  for (const cat of categoryData) {
    const existing = await db
      .select()
      .from(schema.expenseCategories)
      .where(eq(schema.expenseCategories.name, cat.name))
      .limit(1);

    if (existing.length === 0) {
      await db
        .insert(schema.expenseCategories)
        .values({ ...cat, businessId: business.id });
    } else if (!existing[0].businessId) {
      await db
        .update(schema.expenseCategories)
        .set({ businessId: business.id })
        .where(eq(schema.expenseCategories.name, cat.name));
    }
  }
  console.log(`✅ Categorías de gastos listas`);

  // Actualizar products sin businessId
  await db
    .update(schema.products)
    .set({ businessId: business.id })
    .where(isNull(schema.products.businessId));

  // Crear productos si no existen
  const existingProducts = await db.select().from(schema.products).limit(1);
  if (existingProducts.length === 0) {
    const products = [
      {
        name: "Crema de leche con fresa",
        description: "Crema de leche con topping de fresa",
        salePrice: 5.0,
        businessId: business.id,
      },
      {
        name: "Crema de leche con manjar",
        description: "Crema de leche con topping de manjar",
        salePrice: 5.0,
        businessId: business.id,
      },
      {
        name: "Mini Donas (6 unidades)",
        description: "Paquete de 6 mini donas",
        salePrice: 3.0,
        businessId: business.id,
      },
      {
        name: "Mini Donas (12 unidades)",
        description: "Paquete de 12 mini donas",
        salePrice: 5.0,
        businessId: business.id,
      },
      {
        name: "Combo Crema + Mini Donas",
        description: "Una crema + 6 mini donas",
        salePrice: 7.0,
        businessId: business.id,
      },
    ];

    await db.insert(schema.products).values(products);
    console.log(`✅ ${products.length} productos creados`);
  } else {
    console.log(`ℹ️  Productos existentes asociados al negocio`);
  }

  console.log("\n🎉 Seed completado!");
  console.log("📧 Email: admin@negocio.com");
  console.log("🔑 Contraseña: admin123");

  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
