import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminOrderListClient } from "@/components/admin/admin-order-list-client"
import { Database } from "@/types/supabase"

type ProductInfo = Pick<Database['public']['Tables']['products']['Row'], 'name' | 'is_digital'>

type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  products: ProductInfo | null
}

export type OrderWithDetails = Database['public']['Tables']['orders']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'first_name' | 'last_name'> | null
  order_items: OrderItem[]
}

export default async function AdminOrdersPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

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
        *,
        products (
          name,
          is_digital
        )
      )
    `)
    .order('created_at', { ascending: false })

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