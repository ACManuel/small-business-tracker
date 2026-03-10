import { getProducts } from "@/features/products/actions/product-actions";
import { ProductList } from "@/features/products/components/product-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/productos/nuevo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>
      <ProductList products={products} />
    </div>
  );
}
