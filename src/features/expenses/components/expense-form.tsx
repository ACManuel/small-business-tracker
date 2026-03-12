"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  expenseSchema,
  type ExpenseFormValues,
} from "../schemas/expense-schema";
import { createExpense } from "../actions/expense-actions";
import { getToday } from "@/lib/format";

type Category = {
  id: string;
  name: string;
  color: string;
};

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: getToday(),
    },
  });

  async function onSubmit(data: ExpenseFormValues) {
    const result = await createExpense(data);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Gasto registrado");
    reset({ date: getToday() });
    setSelectedCategory("");
    router.push("/gastos");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">¿En qué se gastó?</Label>
        <textarea
          id="description"
          placeholder="Ej: Leche 6L, Harina 5kg, Transporte, Fresas 2kg"
          className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={500}
          {...register("description")}
        />
        <p className="text-xs text-muted-foreground">
          Puedes escribir varios conceptos en un solo gasto (máximo 500 caracteres).
        </p>
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monto (S/)</Label>
        <Input
          id="amount"
          type="number"
          step="0.50"
          min="0"
          placeholder="25.00"
          className="h-12"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            if (value) {
              setSelectedCategory(value);
              setValue("categoryId", value);
            }
          }}
        >
          <SelectTrigger className="h-12 w-full">
            <span
              data-slot="select-value"
              className={`flex flex-1 text-left text-sm ${
                selectedCategory ? "" : "text-muted-foreground"
              }`}
            >
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Seleccionar categoría"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" className="h-12" {...register("date")} />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Registrar gasto"
        )}
      </Button>
    </form>
  );
}
