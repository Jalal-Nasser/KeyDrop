import { createServerClient } from "@/lib/supabase/server" // Updated import
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminOrderListClient } from "@/components/admin/admin-order-list-client"
import { Database, Tables } from "@/types/supabase" // Import Database and Tables

type ProductInfo = Pick<Tables<'products'>, 'name' | 'is_digital' | 'image'>

type OrderItem = Tables<'order_items'> & {
  products: ProductInfo[] | null // Changed to array
}

export type OrderWithDetails = Tables<'orders'> & { // Extend Tables<'orders'>
  profiles: Pick<Tables<'profiles'>, 'first_name' | 'last_name'> | null
  order_items: OrderItem[]
}

export default async function AdminOrdersPage() {
  const supabase = await createServerClient() // Await the client
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: Pick<Tables<'profiles'>, 'is_admin'> | null, error: any }; // Explicitly type profile

  if (!profile?.is_admin) {
    redirect("/account")
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      ),
      order_items (
        id, product_id, quantity, price_at_purchase, product_key, product_name, sku, unit_price, line_total,
        products (
          name,
          is_digital,
          image
        )
      )
    `)
    .order('created_at', { ascending: false }) as { data: OrderWithDetails[] | null, error: any }; // Explicitly type data

  const orders: OrderWithDetails[] = data || []

  if (error) {
    console.error("Error fetching orders:", error)
    return <div>Error loading orders.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>Manage and fulfill customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminOrderListClient orders={orders} />
      </CardContent>
    </Card>
  )
}