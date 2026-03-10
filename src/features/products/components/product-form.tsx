"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product-schema";
import { createProduct, updateProduct } from "../actions/product-actions";

type Product = {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? undefined,
          salePrice: product.salePrice,
        }
      : undefined,
  });

  async function onSubmit(data: ProductFormValues) {
    const result = isEditing
      ? await updateProduct(product.id, data)
      : await createProduct(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Producto actualizado" : "Producto creado");
    router.push("/productos");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Ej: Crema de leche con fresa"
          className="h-12"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Breve descripción"
          className="h-12"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salePrice">Precio de venta (S/)</Label>
        <Input
          id="salePrice"
          type="number"
          step="0.50"
          min="0"
          placeholder="5.00"
          className="h-12"
          {...register("salePrice", { valueAsNumber: true })}
        />
        {errors.salePrice && (
          <p className="text-xs text-destructive">{errors.salePrice.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditing ? (
          "Guardar cambios"
        ) : (
          "Crear producto"
        )}
      </Button>
    </form>
  );
}
