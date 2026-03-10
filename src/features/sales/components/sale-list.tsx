"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { deleteSale } from "../actions/sale-actions";
import { toast } from "sonner";

type Sale = {
  id: string;
  date: string;
  totalAmount: number;
  notes: string | null;
};

export function SaleList({ sales }: { sales: Sale[] }) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Sin ventas</p>
        <p className="text-sm mt-1">
          No hay ventas registradas en este período
        </p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    await deleteSale(id);
    toast.success("Venta eliminada");
  }

  return (
    <div className="space-y-2">
      {sales.map((sale) => (
        <Card key={sale.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-green-600">
                +{formatCurrency(sale.totalAmount)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {formatDate(sale.date)}
                </span>
                {sale.notes && (
                  <span className="text-xs text-muted-foreground truncate">
                    · {sale.notes}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(sale.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
