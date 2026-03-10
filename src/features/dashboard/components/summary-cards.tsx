"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryProps = {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  label: string;
};

export function SummaryCards({
  totalSales,
  totalExpenses,
  profit,
  label,
}: SummaryProps) {
  const profitStatus =
    profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral";

  return (
    <div className="space-y-3">
      {/* Profit card - hero */}
      <Card
        className={cn(
          "border-2",
          profitStatus === "positive" && "border-green-500/30 bg-green-50/50",
          profitStatus === "negative" && "border-red-500/30 bg-red-50/50",
          profitStatus === "neutral" && "border-yellow-500/30 bg-yellow-50/50"
        )}
      >
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "text-3xl font-bold mt-1",
                  profitStatus === "positive" && "text-green-600",
                  profitStatus === "negative" && "text-red-600",
                  profitStatus === "neutral" && "text-yellow-600"
                )}
              >
                {formatCurrency(profit)}
              </p>
              <p
                className={cn(
                  "text-xs mt-1 font-medium",
                  profitStatus === "positive" && "text-green-600",
                  profitStatus === "negative" && "text-red-600",
                  profitStatus === "neutral" && "text-yellow-600"
                )}
              >
                {profitStatus === "positive" && "¡Hay ganancia! 🎉"}
                {profitStatus === "negative" && "Hay pérdida 📉"}
                {profitStatus === "neutral" && "Sin ganancia ni pérdida"}
              </p>
            </div>
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                profitStatus === "positive" && "bg-green-100",
                profitStatus === "negative" && "bg-red-100",
                profitStatus === "neutral" && "bg-yellow-100"
              )}
            >
              {profitStatus === "positive" && (
                <TrendingUp className="h-6 w-6 text-green-600" />
              )}
              {profitStatus === "negative" && (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
              {profitStatus === "neutral" && (
                <Minus className="h-6 w-6 text-yellow-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales and Expenses */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ventas</p>
                <p className="font-bold text-sm text-green-600">
                  {formatCurrency(totalSales)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="font-bold text-sm text-destructive">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
