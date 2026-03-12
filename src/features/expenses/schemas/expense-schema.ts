import { z } from "zod";

export const expenseSchema = z.object({
  description: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(500, "La descripción es muy larga (máximo 500 caracteres)"),
  amount: z
    .number({ error: "El monto es obligatorio" })
    .positive("El monto debe ser mayor a 0")
    .max(99999, "El monto es muy alto"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  date: z.string().min(1, "La fecha es obligatoria"),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
