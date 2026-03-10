"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "../actions/expense-actions";
import { toast } from "sonner";

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string | null;
  categoryColor: string | null;
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Sin gastos</p>
        <p className="text-sm mt-1">No hay gastos registrados en este período</p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    await deleteExpense(id);
    toast.success("Gasto eliminado");
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {expense.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDate(expense.date)}
                </span>
                {expense.categoryName && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      borderColor: expense.categoryColor ?? undefined,
                      color: expense.categoryColor ?? undefined,
                    }}
                  >
                    {expense.categoryName}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="font-semibold text-sm text-destructive">
                -{formatCurrency(expense.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(expense.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
