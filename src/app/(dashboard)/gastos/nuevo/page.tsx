import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExpenseCategories } from "@/features/expenses/actions/expense-actions";
import { ExpenseForm } from "@/features/expenses/components/expense-form";

export default async function NuevoGastoPage() {
  const categories = await getExpenseCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/gastos"
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Registrar gasto</h1>
      </div>
      <ExpenseForm categories={categories} />
    </div>
  );
}
