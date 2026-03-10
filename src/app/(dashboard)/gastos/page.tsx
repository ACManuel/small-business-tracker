import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getExpenses } from "@/features/expenses/actions/expense-actions";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { formatCurrency, getStartOfMonth, getToday } from "@/lib/format";

export default async function GastosPage() {
  const monthStart = getStartOfMonth();
  const today = getToday();
  const expenses = await getExpenses(monthStart, today);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gastos</h1>
          <p className="text-sm text-muted-foreground">
            Este mes: <span className="text-destructive font-medium">{formatCurrency(total)}</span>
          </p>
        </div>
        <Link href="/gastos/nuevo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
}
