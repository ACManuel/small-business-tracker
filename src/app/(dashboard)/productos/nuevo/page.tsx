import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/products/components/product-form";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/productos"
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  );
}
