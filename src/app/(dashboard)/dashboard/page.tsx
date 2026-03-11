import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Receipt } from "lucide-react";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { WeeklyChart } from "@/features/dashboard/components/weekly-chart";
import {
  getDashboardSummary,
  getWeeklyChartData,
} from "@/features/dashboard/actions/dashboard-actions";
import { getToday, getStartOfWeek, formatCurrency } from "@/lib/format";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const today = getToday();

  // Vista simplificada para miembros
  if (role === "member") {
    const todaySales = await getDashboardSummary(today, today);
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">¡Hola! 👋</h1>

        <Card className="border-2 border-green-500/30 bg-green-50/50">
          <CardContent className="py-5">
            <p className="text-sm text-muted-foreground">Tus ventas de hoy</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(todaySales.totalSales)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySales.totalSales === 0
                ? "Aún no hay ventas registradas"
                : "Acumulado del día"}
            </p>
          </CardContent>
        </Card>

        <Link href="/ventas/nueva">
          <Button className="h-14 w-full gap-2 text-sm font-medium">
            <ShoppingCart className="h-5 w-5" />
            Registrar venta
          </Button>
        </Link>

        <Link href="/ventas">
          <Button variant="outline" className="h-12 w-full gap-2 text-sm">
            Ver mis ventas del día
          </Button>
        </Link>
      </div>
    );
  }

  // Vista completa para dueños
  const weekStart = getStartOfWeek();

  const [todaySummary, weekSummary, weeklyData] = await Promise.all([
    getDashboardSummary(today, today),
    getDashboardSummary(weekStart, today),
    getWeeklyChartData(weekStart, today),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">¡Hola! 👋</h1>

      {/* Today summary */}
      <SummaryCards
        totalSales={todaySummary.totalSales}
        totalExpenses={todaySummary.totalExpenses}
        profit={todaySummary.profit}
        label="Ganancia hoy"
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/ventas/nueva">
          <Button
            variant="outline"
            className="h-14 w-full gap-2 text-sm font-medium"
          >
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Registrar venta
          </Button>
        </Link>
        <Link href="/gastos/nuevo">
          <Button
            variant="outline"
            className="h-14 w-full gap-2 text-sm font-medium"
          >
            <Receipt className="h-5 w-5 text-red-500" />
            Registrar gasto
          </Button>
        </Link>
      </div>

      {/* Weekly chart */}
      <WeeklyChart data={weeklyData} />

      {/* Week summary text */}
      <div className="text-center text-sm text-muted-foreground bg-background rounded-xl p-4 border">
        <p>
          Esta semana vendiste{" "}
          <span className="font-medium text-green-600">
            S/ {weekSummary.totalSales.toFixed(2)}
          </span>{" "}
          e invertiste{" "}
          <span className="font-medium text-destructive">
            S/ {weekSummary.totalExpenses.toFixed(2)}
          </span>
        </p>
        <p className="mt-1 font-medium text-foreground">
          {weekSummary.profit > 0
            ? `Tu ganancia semanal es S/ ${weekSummary.profit.toFixed(2)} 🎉`
            : weekSummary.profit < 0
            ? `Tu pérdida semanal es S/ ${Math.abs(weekSummary.profit).toFixed(2)} 📉`
            : "Estás en punto de equilibrio esta semana"}
        </p>
      </div>
    </div>
  );
}
