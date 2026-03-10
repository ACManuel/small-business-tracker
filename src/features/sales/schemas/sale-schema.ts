import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string(),
  quantity: z.number().int().positive("La cantidad debe ser al menos 1"),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
});

export const saleSchema = z
  .object({
    date: z.string().min(1, "La fecha es obligatoria"),
    notes: z.string().max(200).optional(),
    items: z.array(saleItemSchema).default([]),
    freeAmount: z.number().positive("El monto debe ser mayor a 0").optional(),
  })
  .refine(
    (d) => d.items.length > 0 || (d.freeAmount != null && d.freeAmount > 0),
    { message: "Agrega al menos un producto o ingresa un monto" }
  );

export type SaleFormValues = z.infer<typeof saleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
