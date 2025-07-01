"use client"
import Image from "next/image"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { gql } from "graphql-request"
import { client } from "@/lib/graphql"
import { Skeleton } from "@/components/ui/skeleton"

// Define the structure of the product data from the API
interface ApiProduct {
  databaseId: number;
  name: string;
  description: string | null;
  image: {
    sourceUrl: string;
  } | null;
  onSale: boolean;
  price: string;
  regularPrice?: string;
  productCategories: {
    nodes: { name: string }[];
  };
  productTags: {
    nodes: { name: string }[];
  };
}

// GraphQL query to fetch products with all necessary details
const GET_WEEKLY_PRODUCTS_QUERY = gql`
  query GetWeeklyProducts($first: Int!) {
    products(first: $first, where: {orderby: {field: DATE, order: DESC}}) {
      nodes {
        databaseId
        name
        description(format: RAW)
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          onSale
          price(format: RAW)
          regularPrice(format: RAW)
        }
        ... on VariableProduct {
          onSale
          price(format: RAW)
          regularPrice(format: RAW)
        }
        # Add inline fragment for productCategories and productTags
        ... on Product {
          productCategories {
            nodes {
              name
            }
          }
          productTags {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

export function WeeklyProducts({ limit = 8 }) {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [quickViewProduct, setQuickViewProduct] = useState<ApiProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cardQuantities, setCardQuantities] = useState<{[key: number]: number}>({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.request<{ products: { nodes: ApiProduct[] } }>(GET_WEEKLY_PRODUCTS_QUERY, { first: limit });
        setProducts(data.products.nodes);
      } catch (err) {
        console.error("Failed to fetch weekly products:", err)
        setError("Could not load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    };
    fetchProducts();
  }, [limit]);

  const handleQuickViewOpen = (product: ApiProduct) => {
    setQuickViewProduct(product)
    setQuantity(1)
  }

  const handleQuickViewClose = () => {
    setQuickViewProduct(null)
  }

  const handleCardQuantityChange = (productId: number, newQuantity: number) => {
    setCardQuantities(prev => ({...prev, [productId]: Math.max(1, newQuantity)}))
  }

  const handleAddToCart = (product: ApiProduct, quantity: number) => {
    addToCart({
      id: product.databaseId,
      name: product.name,
      price: product.price,
      image: product.image?.sourceUrl,
    }, quantity);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-16 h-0.5 mb-8 bg-blue-600"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-16 h-0.5 mb-8" style={{ backgroundColor: "#1e73be" }}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const currentCardQuantity = cardQuantities[product.databaseId] || 1;
            return (
              <div
                key={product.databaseId}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
              >
                {product.onSale && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                      SALE
                    </span>
                  </div>
                )}
                <div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image?.sourceUrl || "/placeholder.jpg"}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  {product.onSale && product.regularPrice && <span className="text-gray-500 line-through mr-2">${product.regularPrice}</span>}
                  <span>${product.price}</span>
                </div>
                <button
                  className="w-full py-2 px-4 rounded text-sm font-medium transition-colors mb-3 hover:brightness-90"
                  style={{ backgroundColor: "#dc3545", color: "white" }}
                  onClick={() => handleQuickViewOpen(product)}
                >
                  QUICK VIEW
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button onClick={() => handleCardQuantityChange(product.databaseId, currentCardQuantity - 1)} className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">-</button>
                    <input type="number" value={currentCardQuantity} className="w-12 text-center border-0 text-sm py-1" readOnly />
                    <button onClick={() => handleCardQuantityChange(product.databaseId, currentCardQuantity + 1)} className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">+</button>
                  </div>
                  <button
                    className="text-white p-2 rounded hover:bg-blue-700 transition-colors"
                    style={{ backgroundColor: "#1e73be" }}
                    onClick={() => handleAddToCart(product, currentCardQuantity)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {quickViewProduct && (
          <Dialog open={!!quickViewProduct} onOpenChange={handleQuickViewClose}>
            <DialogContent className="sm:max-w-3xl p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  {quickViewProduct.onSale && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        SALE
                      </span>
                    </div>
                  )}
                  <Image
                    src={quickViewProduct.image?.sourceUrl || "/placeholder.jpg"}
                    alt={quickViewProduct.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">{quickViewProduct.name}</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {quickViewProduct.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-baseline gap-2">
                    {quickViewProduct.onSale && quickViewProduct.regularPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ${quickViewProduct.regularPrice}
                      </span>
                    )}
                    <span className="text-2xl font-semibold text-blue-600">
                      ${quickViewProduct.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2"><Minus size={16}/></button>
                      <input type="number" value={quantity} readOnly className="w-12 text-center border-y-0 border-x" />
                      <button onClick={() => setQuantity(q => q + 1)} className="p-2"><Plus size={16}/></button>
                    </div>
                    <Button 
                      size="lg" 
                      className="flex-grow bg-[#1e73be] hover:bg-[#1a63a3] text-white"
                      onClick={() => {
                        handleAddToCart(quickViewProduct, quantity)
                        handleQuickViewClose()
                      }}
                    >
                      <ShoppingCart className="mr-2" />
                      ADD TO CART
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 pt-4">
                    <p><strong>Categories:</strong> {quickViewProduct.productCategories.nodes.map(c => c.name).join(', ')}</p>
                    <p><strong>Tags:</strong> {quickViewProduct.productTags.nodes.map(t => t.name).join(', ')}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}