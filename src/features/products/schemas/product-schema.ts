import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  description: z.string().max(200, "La descripción es muy larga").optional(),
  salePrice: z
    .number({ error: "El precio es obligatorio" })
    .positive("El precio debe ser mayor a 0")
    .max(9999, "El precio es muy alto"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
