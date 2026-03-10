"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { toggleProduct } from "../actions/product-actions";
import { toast } from "sonner";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
  isActive: boolean;
};

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Sin productos</p>
        <p className="text-sm mt-1">Crea tu primer producto para empezar</p>
      </div>
    );
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await toggleProduct(id, !currentActive);
    toast.success(currentActive ? "Producto desactivado" : "Producto activado");
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className={!product.isActive ? "opacity-60" : ""}
        >
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{product.name}</p>
                {!product.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {product.description}
                </p>
              )}
              <p className="text-sm font-semibold mt-1">
                {formatCurrency(product.salePrice)}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Link href={`/productos/${product.id}/editar`}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleToggle(product.id, product.isActive)}
              >
                {product.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
