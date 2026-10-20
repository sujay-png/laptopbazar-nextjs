import { useState, useEffect } from 'react';
import { loadproducts } from "@/app/action/products";
import { loadVendor } from "@/app/action/vendor";
import { loadUniqueConditions } from "@/app/action/stock";

export function useStockFormData() {
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, vendorsData, conditionsData] = await Promise.all([
          loadproducts(),
          loadVendor(),
          loadUniqueConditions()
        ]);
        setProducts(productsData || []);
        setVendors(vendorsData || []);
        setConditions(conditionsData || []);
      } catch (error) {
        console.error("Failed to fetch stock form data:", error);
      }
    };
    fetchData();
  }, []);

  return { products, vendors, conditions };
}
