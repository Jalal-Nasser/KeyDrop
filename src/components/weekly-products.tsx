"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { getImagePath } from "@/lib/utils"
import { Card, CardContent } from "./ui/card"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import Image from "next/image"
import { Product } from "@/types/product"

export default function WeeklyProducts({ title }: { title: string }) {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get products that are marked as most sold first
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_most_sold', true)
          .order('id', { ascending: true })
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          // Remove duplicates by id and ensure type safety
          const uniqueProducts = Array.from(
            new Map(
              data
                .filter((item): item is typeof item & { is_most_sold: boolean } => 
                  item !== null && typeof item === 'object' && 'id' in item
                )
                .map(item => [item.id, item])
            ).values()
          );
          
          const typedData: Product[] = uniqueProducts.map(item => ({
            id: item.id,
            name: item.name || 'Product',
            description: item.description ?? null,
            price: Number(item.price) || 0,
            image: item.image ?? null,
            category: item.category ?? null,
            created_at: item.created_at ?? new Date().toISOString(),
            is_most_sold: Boolean(item.is_most_sold),
            inventory_count: Number(item.inventory_count) || 0,
            is_digital: Boolean(item.is_digital),
            is_on_sale: Boolean(item.is_on_sale),
            sale_price: item.sale_price ? Number(item.sale_price) : null,
            sku: item.sku ?? null
          }));
          
          setProducts(typedData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                <div className="relative aspect-square bg-gray-50">
                  {product.image ? (
                    <Image
                      src={getImagePath(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <h3 className="font-medium text-lg mb-2 text-center line-clamp-2">{product.name}</h3>
                  
                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        {product.is_on_sale && product.sale_price ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold">
                              ${product.sale_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.is_on_sale && product.sale_price 
                            ? product.sale_price 
                            : product.price,
                          image: product.image || ''
                        })}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>
    </section>
  );
}