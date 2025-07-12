import { createSupabaseServerClient } from "@/lib/supabaseServer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderStatusUpdater } from "@/components/admin/order-status-updater"
import { Download } from "lucide-react"
import { ReSendInvoiceButton } from "@/components/admin/resend-invoice-button"
import { AdminOrderListClient } from "@/components/admin/admin-order-list-client" // Import the new client component

export const revalidate = 0 // Disable cache to always get fresh data

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean | null; // Added is_admin
  }[] | null;
  order_items: {
    product_id: number;
    quantity: number;
    products: { name: string }[] | null;
  }[];
}

export default async function AdminOrdersPage() {
  const supabase = createSupabaseServerClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total,
      status,
      profiles (first_name, last_name, is_admin),
      order_items (product_id, quantity, products (name))
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all orders for admin:", error)
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>
        <p className="text-red-500">Error loading orders: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        {/* Render the client component and pass the fetched orders */}
        <AdminOrderListClient initialOrders={orders || []} />
      </Card>
    </div>
  )
}