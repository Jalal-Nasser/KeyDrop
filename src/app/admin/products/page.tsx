import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { Product } from "@/types/product"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient()
  let products: Product[] | null = null;
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching products for admin page:", error);
      fetchError = error.message;
    } else {
      products = data as Product[];
    }
  } catch (e: any) {
    console.error("Unexpected error during admin product fetch:", e);
    fetchError = e.message || "An unexpected error occurred.";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <ProductForm />
      </div>
      <div className="border rounded-lg">
        {fetchError ? (
          <div className="p-6 text-center text-red-500">
            Error loading products: {fetchError}
            <p className="text-gray-600 text-sm mt-2">Please ensure your Supabase environment variables are correctly configured and your database is accessible.</p>
          </div>
        ) : products && products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <ProductForm product={product} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-gray-600">
            No products available.
          </div>
        )}
      </div>
    </div>
  )
}