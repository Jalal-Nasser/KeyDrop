"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { Product } from "@/types/product"
import { ProductGrid } from "@/components/product-grid"

export default function WeeklyProducts({ title }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // First try to get most sold products
        const { data: mostSoldData, error: mostSoldError } = await supabase
          .from('products')
          .select('*')
          .eq('is_most_sold', true)
          .order('id', { ascending: true })
          .limit(8);

        if (mostSoldError) throw mostSoldError;

        if (mostSoldData && mostSoldData.length > 0) {
          // If we have most sold products, use them
          const typedData: Product[] = mostSoldData.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            sale_price: item.sale_price ? Number(item.sale_price) : null,
            is_on_sale: Boolean(item.is_on_sale),
            is_most_sold: true,
            inventory_count: Number(item.inventory_count) || 0,
            is_digital: Boolean(item.is_digital)
          }));
          
          setProducts(typedData);
        } else {
          // If no most sold products, get the latest products
          const { data: latestProducts, error: latestError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);

          if (latestError) throw latestError;

          if (latestProducts && latestProducts.length > 0) {
            const typedData: Product[] = latestProducts.map(item => ({
              ...item,
              price: Number(item.price) || 0,
              sale_price: item.sale_price ? Number(item.sale_price) : null,
              is_on_sale: Boolean(item.is_on_sale),
              is_most_sold: false,
              inventory_count: Number(item.inventory_count) || 0,
              is_digital: Boolean(item.is_digital)
            }));
            
            setProducts(typedData);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center mt-2">
            Error: {error}
          </p>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-center text-muted-foreground">No products found for this section.</p>
        )}
      </div>
    </section>
  );
}