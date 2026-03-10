import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { businesses } from "./businesses";

export const expenseCategories = sqliteTable("expense_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6b7280"),
  businessId: text("business_id").references(() => businesses.id),
});

export const expenses = sqliteTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  categoryId: text("category_id").references(() => expenseCategories.id),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
