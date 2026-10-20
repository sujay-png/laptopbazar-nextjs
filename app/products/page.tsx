import { loadproducts } from "@/app/action/products"
import { ProductClient } from "./ProductClient"

export default async function ProductsPage() {
  const products = await loadproducts() || [];
  
  return <ProductClient initialProducts={products} />;
}
