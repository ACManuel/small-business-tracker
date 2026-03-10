"use client";

import { useState, useRef } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createExpenseCategory,
  deleteExpenseCategory,
} from "../actions/settings-actions";

type Category = {
  id: string;
  name: string;
  color: string;
};

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export function CategoriesManager({
  categories: initial,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [loading, setLoading] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const result = await createExpenseCategory({ name: name.trim(), color });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Categoría creada");
    setCategories((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), color },
    ]);
    setName("");
    // Reload to sync real IDs
    window.location.reload();
  }

  async function handleDelete(id: string) {
    const result = await deleteExpenseCategory(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Categoría eliminada");
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Lista */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay categorías. Crea una abajo.
          </p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Formulario nueva categoría */}
      <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-border">
        <p className="text-sm font-medium">Nueva categoría</p>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name" className="text-xs">
            Nombre
          </Label>
          <Input
            id="cat-name"
            placeholder="Ej: Empaques"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Color</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "black" : "transparent",
                }}
              />
            ))}
            {/* Custom color */}
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center hover:scale-110 transition-transform"
              style={
                !PRESET_COLORS.includes(color)
                  ? { backgroundColor: color, borderColor: "black" }
                  : {}
              }
            >
              {PRESET_COLORS.includes(color) && (
                <Plus className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
            />
            <span className="text-xs font-mono text-muted-foreground ml-1">
              {color}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
          {loading ? "Guardando..." : "Crear categoría"}
        </Button>
      </form>
    </div>
  );
}
