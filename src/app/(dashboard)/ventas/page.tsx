import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSales } from "@/features/sales/actions/sale-actions";
import { SaleList } from "@/features/sales/components/sale-list";
import { formatCurrency, getStartOfMonth, getToday } from "@/lib/format";

export default async function VentasPage() {
  const monthStart = getStartOfMonth();
  const today = getToday();
  const sales = await getSales(monthStart, today);

  const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Este mes:{" "}
            <span className="text-green-600 font-medium">
              {formatCurrency(total)}
            </span>
          </p>
        </div>
        <Link href="/ventas/nueva">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        </Link>
      </div>
      <SaleList sales={sales} />
    </div>
  );
}
