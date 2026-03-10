"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, PackageX, DollarSign } from "lucide-react";
import { formatCurrency, getToday } from "@/lib/format";
import { createSale } from "../actions/sale-actions";
import type { SaleItem } from "../schemas/sale-schema";

type Product = {
  id: string;
  name: string;
  salePrice: number;
};

type Mode = "productos" | "libre";

export function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("productos");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [freeAmount, setFreeAmount] = useState("");
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  function addItem(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.salePrice,
          subtotal: product.salePrice,
        },
      ];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
        })
        .filter(Boolean) as SaleItem[]
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleSubmit() {
    if (mode === "libre") {
      const amount = parseFloat(freeAmount);
      if (!freeAmount || isNaN(amount) || amount <= 0) {
        toast.error("Ingresa un monto válido mayor a 0");
        return;
      }
      setLoading(true);
      const result = await createSale({ date, notes: notes || undefined, items: [], freeAmount: amount });
      setLoading(false);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Venta registrada");
      router.push("/ventas");
      return;
    }

    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    setLoading(true);
    const result = await createSale({
      date,
      notes: notes || undefined,
      items,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Venta registrada");
    router.push("/ventas");
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("productos")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === "productos"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Con productos
        </button>
        <button
          type="button"
          onClick={() => setMode("libre")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === "libre"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Monto libre
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12"
        />
      </div>

      {mode === "libre" ? (
        /* ── Modo monto libre ── */
        <div className="space-y-2">
          <Label htmlFor="free-amount">Total vendido</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
              S/.
            </span>
            <Input
              id="free-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={freeAmount}
              onChange={(e) => setFreeAmount(e.target.value)}
              className="h-12 pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Úsalo cuando no tengas productos configurados aún o solo quieras
            registrar el total del día.
          </p>
        </div>
      ) : (
        /* ── Modo productos ── */
        <>
          <div className="space-y-2">
            <Label>Seleccionar productos</Label>
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => {
                const inCart = items.find((i) => i.productId === product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addItem(product)}
                    className={`text-left p-3 rounded-xl border-2 transition-all active:scale-[0.98] touch-manipulation ${
                      inCart
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-sm leading-tight">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(product.salePrice)}
                    </p>
                    {inCart && (
                      <p className="text-xs text-primary font-medium mt-1">
                        ×{inCart.quantity}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {products.length === 0 && (
              <div className="text-center py-6 text-muted-foreground space-y-2">
                <PackageX className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-sm">No hay productos activos.</p>
                <p className="text-xs">
                  Usa el modo{" "}
                  <button
                    type="button"
                    className="underline text-foreground"
                    onClick={() => setMode("libre")}
                  >
                    Monto libre
                  </button>{" "}
                  para registrar igualmente la venta.
                </p>
              </div>
            )}
          </div>

          {/* Cart */}
          {items.length > 0 && (
            <Card>
              <CardContent className="py-3 space-y-2">
                <p className="font-medium text-sm flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4" />
                  Detalle de venta
                </p>
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-right text-sm font-medium">
                        {formatCurrency(item.subtotal)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold text-sm">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input
          id="notes"
          placeholder="Ej: Venta en el parque"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-12"
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full h-12"
        disabled={
          loading ||
          (mode === "productos" && items.length === 0) ||
          (mode === "libre" && (!freeAmount || parseFloat(freeAmount) <= 0))
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : mode === "libre" && freeAmount && parseFloat(freeAmount) > 0 ? (
          `Registrar venta · ${formatCurrency(parseFloat(freeAmount))}`
        ) : mode === "productos" && total > 0 ? (
          `Registrar venta · ${formatCurrency(total)}`
        ) : (
          "Registrar venta"
        )}
      </Button>
    </div>
  );
}
