import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveProducts } from "@/features/products/actions/product-actions";
import { SaleForm } from "@/features/sales/components/sale-form";

export default async function NuevaVentaPage() {
  const products = await getActiveProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/ventas"
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Registrar venta</h1>
      </div>
      <SaleForm products={products} />
    </div>
  );
}
